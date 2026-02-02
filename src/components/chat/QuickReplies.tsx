import { Button } from '@/components/ui/button';

interface QuickRepliesProps {
  onSelect: (message: string) => void;
  disabled?: boolean;
}

const quickReplies = [
  { label: "😔 I'm feeling sad", message: "I'm feeling sad today and could use some support." },
  { label: "😰 I'm anxious", message: "I'm feeling anxious and my mind won't stop racing." },
  { label: "💭 Help with my thoughts", message: "I need help with some negative thoughts I've been having." },
  { label: "📅 Let's talk about my day", message: "I'd like to talk about how my day went." },
  { label: "🧠 CBT exercise", message: "I'd like to try a CBT exercise to help me feel better." },
];

export function QuickReplies({ onSelect, disabled }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2 p-2">
      {quickReplies.map((reply) => (
        <Button
          key={reply.label}
          variant="outline"
          size="sm"
          onClick={() => onSelect(reply.message)}
          disabled={disabled}
          className="rounded-full border-border/50 bg-card hover:bg-accent hover:border-accent text-sm btn-calm"
        >
          {reply.label}
        </Button>
      ))}
    </div>
  );
}
