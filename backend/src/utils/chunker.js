/**
 * Recursively split text into chunks with overlap.
 * This keeps semantic continuity between neighboring chunks.
 */
const recursiveChunkText = (text, maxChunkSize, chunkOverlap) => {
  if (!text || !text.trim()) {
    return [];
  }

  const separators = ["\n\n", "\n", ". ", " ", ""];

  const splitWithSeparator = (input, separatorIndex) => {
    if (input.length <= maxChunkSize) {
      return [input.trim()].filter(Boolean);
    }

    const separator = separators[separatorIndex] ?? "";

    if (separator === "") {
      // Hard fallback: force split when no separator works.
      const forced = [];
      let cursor = 0;
      while (cursor < input.length) {
        const end = Math.min(cursor + maxChunkSize, input.length);
        forced.push(input.slice(cursor, end).trim());
        cursor += Math.max(1, maxChunkSize - chunkOverlap);
      }
      return forced.filter(Boolean);
    }

    const parts = input.split(separator);
    if (parts.length === 1) {
      return splitWithSeparator(input, separatorIndex + 1);
    }

    const chunks = [];
    let current = "";

    for (const part of parts) {
      const next = current ? `${current}${separator}${part}` : part;
      if (next.length <= maxChunkSize) {
        current = next;
      } else {
        if (current) {
          chunks.push(current.trim());
        }
        if (part.length > maxChunkSize) {
          chunks.push(...splitWithSeparator(part, separatorIndex + 1));
          current = "";
        } else {
          current = part;
        }
      }
    }

    if (current) {
      chunks.push(current.trim());
    }

    return chunks.filter(Boolean);
  };

  const baseChunks = splitWithSeparator(text, 0);
  if (baseChunks.length <= 1 || chunkOverlap <= 0) {
    return baseChunks;
  }

  // Apply overlap by prefixing each chunk with tail of previous chunk.
  const overlapped = [];
  for (let i = 0; i < baseChunks.length; i += 1) {
    const current = baseChunks[i];
    if (i === 0) {
      overlapped.push(current);
      continue;
    }
    const prev = baseChunks[i - 1];
    const tail = prev.slice(Math.max(0, prev.length - chunkOverlap));
    overlapped.push(`${tail} ${current}`.trim());
  }

  return overlapped;
};

module.exports = {
  recursiveChunkText
};
