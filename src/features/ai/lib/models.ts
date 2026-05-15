// Single env knob for the agent model. Defaults to a cheap fast model that
// is more than sufficient for task decomposition and prioritization.
export const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
