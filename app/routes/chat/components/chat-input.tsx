import { useState, useRef } from "react";
import type { KeyboardEvent } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card } from "~/components/ui/card";
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
    <div className="p-4 bg-card border-t border-border">
      <div className="flex items-end gap-3">
        {/* Action buttons */}
        <div className="flex gap-1 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-primary"
            disabled={disabled}
            title="Đính kèm file"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-primary"
            disabled={disabled}
            title="Đính kèm ảnh"
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
              "min-h-[44px] max-h-[150px] resize-none border border-border bg-background rounded-lg py-3 pr-12 shadow-sm focus:shadow-md transition-shadow",
              "focus-visible:ring-2 focus-visible:ring-primary/20"
            )}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2 h-8 w-8 text-muted-foreground hover:text-primary"
            disabled={disabled}
            title="Chèn emoji"
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="h-11 w-11 rounded-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow mb-1"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        Nhấn{" "}
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
          Enter
        </kbd>{" "}
        để gửi,{" "}
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
          Shift + Enter
        </kbd>{" "}
        để xuống dòng
      </p>
    </div>
  );
}
