/**
 * Chat Service
 * Handles chat API communication and authentication
 */

import { logger } from '@/lib/logger';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatStreamOptions {
  messages: ChatMessage[];
  accessToken: string;
  onChunk: (content: string) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

/**
 * Stream chat responses from the edge function
 */
export async function streamChatResponse({
  messages,
  accessToken,
  onChunk,
  onError,
  onComplete,
}: ChatStreamOptions): Promise<void> {
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
  
  try {
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      if (response.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      throw new Error('Failed to get response from chat service.');
    }

    if (!response.body) {
      throw new Error('No response body received.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch {
          // Incomplete JSON, will be completed in next chunk
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    onComplete();
  } catch (error) {
    logger.error('Chat stream error', { error, messages });
    onError(error instanceof Error ? error : new Error('Unknown error occurred'));
  }
}
