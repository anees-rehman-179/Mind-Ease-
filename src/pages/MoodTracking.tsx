import { useState } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MoodSelector } from '@/components/mood/MoodSelector';
import { MoodChart } from '@/components/mood/MoodChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useMood } from '@/hooks/useMood';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { SmilePlus, TrendingUp, Calendar, Sparkles } from 'lucide-react';

const moodEmojis: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

const encouragements = [
  "You're doing great by tracking your mood! Self-awareness is the first step.",
  "Every day is a new opportunity. Thank you for checking in with yourself.",
  "Remember, it's okay to have difficult days. You're taking positive steps by being here.",
  "Your feelings are valid. Keep going – you're building healthy habits!",
  "Taking time to reflect shows real strength. Be proud of yourself.",
];

export default function MoodTracking() {
  const { isGuest } = useAuth();
  const { entries, addEntry, getRecentEntries, getAverageMood, getStreak } = useMood(isGuest);
  
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const handleSaveMood = () => {
    if (selectedMood === null) return;

    addEntry(selectedMood, notes);
    
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    toast({
      title: "Mood logged! 🌟",
      description: encouragement,
    });

    setSelectedMood(null);
    setNotes('');
  };

  const recentEntries = getRecentEntries(7);
  const averageMood = getAverageMood(7);
  const streak = getStreak();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          {/* Header */}
          <header className="flex items-center gap-4 px-4 py-3 border-b border-border/50 bg-card">
            <SidebarTrigger className="-ml-1" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Mood Tracking</h1>
              <p className="text-xs text-muted-foreground">
                Track how you're feeling and discover patterns
              </p>
            </div>
          </header>

          <ScrollArea className="flex-1 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Guest Mode Notice */}
              {isGuest && (
                <Card className="border-warm bg-warm/30">
                  <CardContent className="py-3 flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-warm-foreground" />
                    <p className="text-sm text-warm-foreground">
                      You're in guest mode. Your mood data won't be saved after you leave.{' '}
                      <a href="/" className="underline font-medium">Sign up</a> to track your progress over time.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="card-calm border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <SmilePlus className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold">
                          {averageMood ? `${averageMood.toFixed(1)}/5` : '—'}
                        </p>
                        <p className="text-sm text-muted-foreground">Avg. mood (7 days)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-calm border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold">{recentEntries.length}</p>
                        <p className="text-sm text-muted-foreground">Entries this week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-calm border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-success-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold">{streak} days</p>
                        <p className="text-sm text-muted-foreground">Current streak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Log Mood Card */}
              <Card className="card-calm border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl">Log Your Mood</CardTitle>
                  <CardDescription>
                    Take a moment to check in with yourself
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <MoodSelector
                    selectedMood={selectedMood}
                    onSelect={setSelectedMood}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      What's contributing to how you feel? (optional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Reflect on your thoughts, activities, or anything else on your mind..."
                      className="min-h-[100px] bg-input/50 border-border/50 focus:border-primary"
                    />
                  </div>

                  <Button
                    onClick={handleSaveMood}
                    disabled={selectedMood === null}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground btn-calm"
                  >
                    Save Mood Entry
                  </Button>
                </CardContent>
              </Card>

              {/* Mood Chart */}
              <MoodChart entries={entries} />

              {/* Recent Entries */}
              {entries.length > 0 && (
                <Card className="card-calm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Entries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {entries.slice(0, 5).map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start gap-4 p-3 rounded-lg bg-muted/50"
                        >
                          <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {format(entry.timestamp, 'EEEE, MMMM d')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(entry.timestamp, 'h:mm a')}
                            </p>
                            {entry.notes && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {entry.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
