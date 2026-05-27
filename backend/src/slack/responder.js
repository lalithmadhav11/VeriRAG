const { randomUUID } = require("crypto");
const QueryHistory = require("../models/QueryHistory");
const { enqueueQueryJob } = require("../queue/producer");
const { formatConfidence, formatCitations } = require("./formatters");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const extractQueryFromMentionText = (text) => {
  if (!text || typeof text !== "string") return "";
  // Remove all mention tags like "<@U12345>".
  return text.replace(/<@[^>]+>/g, "").trim();
};

const waitForJob = async ({ jobId, maxWaitMs = 90_000, pollEveryMs = 2_500 }) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < maxWaitMs) {
    const record = await QueryHistory.findOne({ jobId }).lean();
    if (record && (record.status === "completed" || record.status === "failed")) {
      return record;
    }
    await sleep(pollEveryMs);
  }

  return QueryHistory.findOne({ jobId }).lean();
};

const postThreadMessage = async ({ client, channel, threadTs, text }) => {
  return client.chat.postMessage({
    channel,
    thread_ts: threadTs,
    text
  });
};

// Handler for Slack app_mention.
// Posts immediately to the thread, then runs async queue processing.
const onAppMention = async ({ event, client }) => {
  const channel = event.channel;
  const threadTs = event.ts; // The mention message acts as the thread parent.
  const query = extractQueryFromMentionText(event.text);

  if (!query) {
    await postThreadMessage({
      client,
      channel,
      threadTs,
      text: "Please include a question after mentioning me."
    });
    return;
  }

  const jobId = randomUUID();

  await QueryHistory.create({
    jobId,
    query,
    status: "pending",
    attempts: 0
  });

  // Enqueue the job for BullMQ worker processing.
  await enqueueQueryJob({ jobId, query });

  // Immediate threaded acknowledgment (Slack expects quick handling).
  await postThreadMessage({
    client,
    channel,
    threadTs,
    text: `Queued your request. Working on retrieval + generation…`
  });

  // Background poll + final response.
  void (async () => {
    try {
      const record = await waitForJob({ jobId });
      if (!record) {
        await postThreadMessage({
          client,
          channel,
          threadTs,
          text: `I couldn't find the job record for \`${jobId}\`. Please try again.`
        });
        return;
      }

      if (record.status === "failed") {
        await postThreadMessage({
          client,
          channel,
          threadTs,
          text: `I failed to answer this request.\n\`jobId: ${jobId}\`\nError: ${record.errorMessage || "unknown"}`
        });
        return;
      }

      const answer = record.answer || "_No answer returned._";
      const confidence = formatConfidence({
        hallucinationScore: record.hallucinationScore,
        flagged: record.flagged,
        usedWebFallback: record.usedWebFallback
      });
      const citations = formatCitations(record.finalSources);

      const reply = `*Answer*\n>${answer}\n\n${confidence}\n\n${citations}`;

      await postThreadMessage({
        client,
        channel,
        threadTs,
        text: reply
      });
    } catch (error) {
      await postThreadMessage({
        client,
        channel,
        threadTs,
        text: `Unexpected error while responding.\n${error.message || String(error)}`
      });
    }
  })();
};

module.exports = {
  onAppMention
};

