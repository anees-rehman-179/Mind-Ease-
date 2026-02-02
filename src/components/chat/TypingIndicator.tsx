import { Heart } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <Heart className="w-4 h-4 text-primary" />
      </div>
      
      <div className="bg-chat-bot border border-chat-bot-border rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
        </div>
      </div>
    </div>
  );
}
