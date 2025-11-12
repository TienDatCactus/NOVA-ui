import { useState, useRef } from "react";
import type { KeyboardEvent } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Send, Paperclip, Smile, Image as ImageIcon } from "lucide-react";
import { cn } from "~/lib/utils";

type ChatInputProps = {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function ChatInput({
  onSendMessage,
  placeholder = "Nhập tin nhắn...",
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="p-4 border-t bg-background">
      <div className="flex items-center gap-2">
        {/* Action buttons */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Text input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "min-h-[40px] max-h-[150px] resize-none border border-accent py-2.5 pr-12"
            )}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 bottom-1 h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="h-9 w-9 rounded-full flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        Nhấn Enter để gửi, Shift + Enter để xuống dòng
      </p>
    </div>
  );
}
