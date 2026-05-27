/**
 * Registers Slack event listeners on an existing Bolt App instance.
 * The caller is responsible for creating the Bolt App + ExpressReceiver.
 */
const registerSlackEvents = (slackApp) => {
  slackApp.event("app_mention", async ({ event, client, ack }) => {
    // Avoid loops: ignore events coming from Slack bots.
    if (event && event.bot_id) return;

    // Slack requires quick acknowledgment; run heavy work asynchronously.
    if (ack) await ack();

    // Lazy-load responder to avoid initializing queue/clients at server boot time.
    // (BullMQ/Redis clients are still used by the worker; this just keeps
    // Slack-specific deps from loading unless Slack receives traffic.)
    const { onAppMention } = require("./responder");

    void onAppMention({
      event,
      client
      // We keep deps inside responder (it imports queue/history).
    });
  });
};

module.exports = {
  registerSlackEvents
};

