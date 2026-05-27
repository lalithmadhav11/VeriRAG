const clamp01 = (v) => Math.max(0, Math.min(1, v));

const formatConfidence = ({ hallucinationScore, flagged, usedWebFallback }) => {
  const score = typeof hallucinationScore === "number" ? hallucinationScore : 0;
  const safePct = clamp01(score) * 100;
  const flaggedText = flagged ? "*YES*" : "*NO*";
  const webText = usedWebFallback ? " (web fallback used)" : "";

  return `*Grounding confidence:* ${safePct.toFixed(1)}%${webText}\n*Hallucination flagged:* ${flaggedText}`;
};

const formatCitations = (finalSources) => {
  if (!Array.isArray(finalSources) || finalSources.length === 0) {
    return "_No citations available._";
  }

  const shown = finalSources.slice(0, 8);
  const lines = shown.map((src, idx) => `${idx + 1}. ${src}`);
  const more = finalSources.length > shown.length ? `\n_+${finalSources.length - shown.length} more_` : "";

  return `*Sources:*\n${lines.join("\n")}${more}`;
};

module.exports = {
  formatConfidence,
  formatCitations
};
