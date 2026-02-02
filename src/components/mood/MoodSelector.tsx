import { cn } from '@/lib/utils';

interface MoodSelectorProps {
  selectedMood: number | null;
  onSelect: (mood: number) => void;
}

const moods = [
  { value: 1, emoji: '😞', label: 'Very Low', color: 'bg-mood-1' },
  { value: 2, emoji: '😕', label: 'Low', color: 'bg-mood-2' },
  { value: 3, emoji: '😐', label: 'Neutral', color: 'bg-mood-3' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'bg-mood-4' },
  { value: 5, emoji: '😊', label: 'Great', color: 'bg-mood-5' },
];

export function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-center text-muted-foreground">
        How are you feeling right now?
      </p>
      
      <div className="flex justify-center gap-4">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => onSelect(mood.value)}
            className={cn(
              'mood-emoji flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
              selectedMood === mood.value
                ? `${mood.color} selected ring-2 ring-primary ring-offset-2`
                : 'hover:bg-muted'
            )}
          >
            <span className="text-4xl">{mood.emoji}</span>
            <span className="text-xs text-muted-foreground">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
