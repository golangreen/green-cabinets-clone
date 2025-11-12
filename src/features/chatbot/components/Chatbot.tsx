import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, ChevronUp, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChatStream } from "../hooks/useChatStream";
import { ROUTES } from "@/constants/routes";

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { session } = useAuth();
  const { messages, isLoading, sendMessage, messagesEndRef } = useChatStream();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input.trim() };
    setInput("");
    await sendMessage(userMessage);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollPageToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    <>
      {/* Scroll to Top Button */}
      {!isOpen && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-[140px] right-6 h-10 w-10 rounded-full shadow-elegant z-50 bg-black/40 backdrop-blur-md border border-white/30 hover:bg-black/50 text-white"
          size="icon"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}

      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => {
            if (!session) {
              navigate(ROUTES.AUTH);
            } else {
              setIsOpen(true);
            }
          }}
          className="fixed bottom-[80px] right-6 h-10 w-10 rounded-full shadow-elegant z-50 bg-black/40 backdrop-blur-md border border-white/30 hover:bg-black/50 text-white"
          size="icon"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      )}

      {/* Scroll to Bottom Button */}
      {!isOpen && (
        <Button
          onClick={scrollPageToBottom}
          className="fixed bottom-6 right-6 h-10 w-10 rounded-full shadow-elegant z-50 bg-black/40 backdrop-blur-md border border-white/30 hover:bg-black/50 text-white"
          size="icon"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-background border border-border rounded-lg shadow-elegant flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">Design Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  Hi! I'm your design assistant. Ask me about our cabinets,
                  browse our gallery, or get design suggestions!
                </p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about our cabinets..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
