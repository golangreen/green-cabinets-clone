// Google Gemini through its OpenAI-compatible endpoint, with the project's own
// GEMINI_API_KEY. Request bodies stay in the chat-completions shape the
// functions already build (messages, tools, stream).

export const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

/** "fast" for chat and captions, "pro" for reading drawings. Overridable per project via secrets. */
export function geminiModel(kind: "fast" | "pro"): string {
  return kind === "pro"
    ? Deno.env.get("GEMINI_MODEL_PRO") || "gemini-3.8-pro"
    : Deno.env.get("GEMINI_MODEL_FAST") || "gemini-3.8-flash";
}
