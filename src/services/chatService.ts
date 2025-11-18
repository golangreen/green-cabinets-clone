export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatStreamOptions {
  messages: ChatMessage[];
  accessToken: string;
  onChunk?: (content: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Service for managing chat operations.
 * Handles streaming chat responses from the edge function.
 */
export class ChatService {
  private readonly CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

  /**
   * Streams chat responses from the edge function
   * @param options - Configuration for the chat stream
   */
  async streamChat(options: ChatStreamOptions): Promise<void> {
    const { messages, accessToken, onChunk, onComplete, onError } = options;

    try {
      const response = await fetch(this.CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        if (response.status === 402) {
          throw new Error('AI service is temporarily unavailable.');
        }
        throw new Error('Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });
        const lines = textBuffer.split("\n");
        textBuffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.substring(6);
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                onChunk?.(delta);
              }
            } catch (e) {
              console.error("Error parsing streaming chunk:", e);
            }
          }
        }
      }

      onComplete?.(assistantContent);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error('Chat stream error:', errorObj);
      onError?.(errorObj);
      throw errorObj;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
