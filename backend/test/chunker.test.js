const test = require("node:test");
const assert = require("node:assert/strict");
const { recursiveChunkText } = require("../src/utils/chunker");

test("recursiveChunkText returns empty array for blank input", () => {
  assert.deepEqual(recursiveChunkText("", 100, 10), []);
});

test("recursiveChunkText splits large text into multiple chunks", () => {
  const text = "A".repeat(500) + " " + "B".repeat(500) + " " + "C".repeat(500);
  const chunks = recursiveChunkText(text, 300, 30);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length > 0));
});
