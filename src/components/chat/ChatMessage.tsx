import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/hooks/useChat';
import { format } from 'date-fns';
import { Heart } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === 'bot';

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isBot ? 'justify-start' : 'justify-end'
      )}
    >
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Heart className="w-4 h-4 text-primary" />
        </div>
      )}
      
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isBot
            ? 'bg-chat-bot border border-chat-bot-border text-foreground rounded-tl-sm'
            : 'bg-chat-user text-foreground rounded-tr-sm'
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p
          className={cn(
            'text-xs mt-2',
            isBot ? 'text-muted-foreground' : 'text-primary-foreground/70'
          )}
        >
          {format(message.timestamp, 'h:mm a')}
        </p>
      </div>
    </div>
  );
}
