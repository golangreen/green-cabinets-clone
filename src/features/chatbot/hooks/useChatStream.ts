/**
 * useChatStream Hook
 * Manages chat streaming state and operations
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { streamChatResponse, ChatMessage } from '@/services/chatService';
import { ROUTES } from '@/constants/routes';

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(
    async (userMessage: ChatMessage) => {
      if (!session) {
        toast({
          title: 'Authentication Required',
          description: 'Please login to use the chatbot',
          variant: 'destructive',
        });
        navigate(ROUTES.AUTH);
        return;
      }

      // Add user message
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Add initial assistant message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      let assistantContent = '';

      await streamChatResponse({
        messages: [...messages, userMessage],
        accessToken: session.access_token,
        onChunk: (content) => {
          assistantContent += content;
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage?.role === 'assistant') {
              lastMessage.content = assistantContent;
            }
            return newMessages;
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
          // Remove the empty assistant message on error
          setMessages((prev) => prev.slice(0, -1));
          setIsLoading(false);
        },
        onComplete: () => {
          setIsLoading(false);
        },
      });
    },
    [messages, session, navigate, toast]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    messagesEndRef,
  };
}
