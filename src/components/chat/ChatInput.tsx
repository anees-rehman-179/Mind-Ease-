import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-end p-4 border-t border-border/50 bg-card">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Share what's on your mind..."
        disabled={disabled}
        className="min-h-[48px] max-h-[120px] resize-none bg-input/50 border-border/50 focus:border-primary rounded-xl"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        size="icon"
        className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0 btn-calm"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
