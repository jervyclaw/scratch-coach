// Model prices for cost estimates (USD per 1M tokens).
// Source: Anthropic claude-api skill model table, cached 2026-10-06. Verify current prices before spending:
// https://platform.claude.com/docs/en/about-claude/pricing
"use strict";
const PRICES = {
  "claude-opus-5-5": { input: 4.0, output: 20.0 },
  "claude-sonnet-5-5": { input: 2.0, output: 10.0 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
};
const PRICES_AS_OF = "2026-10-06";

function cost(model, inputTokens, outputTokens) {
  const p = PRICES[model];
  if (!p) throw new Error(`No price for model ${model}. Known: ${Object.keys(PRICES).join(", ")}`);
  return (inputTokens * p.input + outputTokens * p.output) / 1e6;
}

module.exports = { PRICES, PRICES_AS_OF, cost };
