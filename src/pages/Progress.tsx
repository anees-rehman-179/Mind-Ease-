import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useMood } from '@/hooks/useMood';
import { Trophy, Target, Flame, Brain, Heart, Star } from 'lucide-react';

const achievements = [
  { id: 1, title: 'First Check-in', description: 'Logged your first mood', icon: Heart, unlocked: true },
  { id: 2, title: '7-Day Streak', description: 'Tracked mood for 7 days', icon: Flame, unlocked: false },
  { id: 3, title: 'CBT Explorer', description: 'Completed 5 CBT exercises', icon: Brain, unlocked: false },
  { id: 4, title: 'Reflection Master', description: 'Added notes to 10 entries', icon: Star, unlocked: false },
];

export default function ProgressPage() {
  const { isGuest } = useAuth();
  const { entries, getStreak, getAverageMood } = useMood(isGuest);
  
  const streak = getStreak();
  const avgMood = getAverageMood(30);
  const totalEntries = entries.length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="flex items-center gap-4 px-4 py-3 border-b border-border/50 bg-card">
            <SidebarTrigger className="-ml-1" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Your Progress</h1>
              <p className="text-xs text-muted-foreground">Track your mental wellness journey</p>
            </div>
          </header>

          <ScrollArea className="flex-1 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="card-calm border-border/50">
                  <CardContent className="pt-6 text-center">
                    <Flame className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-3xl font-bold">{streak}</p>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </CardContent>
                </Card>
                <Card className="card-calm border-border/50">
                  <CardContent className="pt-6 text-center">
                    <Target className="h-8 w-8 text-accent-foreground mx-auto mb-2" />
                    <p className="text-3xl font-bold">{totalEntries}</p>
                    <p className="text-sm text-muted-foreground">Mood Entries</p>
                  </CardContent>
                </Card>
                <Card className="card-calm border-border/50">
                  <CardContent className="pt-6 text-center">
                    <Trophy className="h-8 w-8 text-warm-foreground mx-auto mb-2" />
                    <p className="text-3xl font-bold">{avgMood ? avgMood.toFixed(1) : '—'}</p>
                    <p className="text-sm text-muted-foreground">Avg. Mood (30 days)</p>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Goal */}
              <Card className="card-calm border-border/50">
                <CardHeader>
                  <CardTitle>Weekly Goal</CardTitle>
                  <CardDescription>Track your mood at least 5 times this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={Math.min((totalEntries / 5) * 100, 100)} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">{Math.min(totalEntries, 5)}/5 check-ins</p>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="card-calm border-border/50">
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className={`p-4 rounded-lg text-center ${achievement.unlocked ? 'bg-success/30' : 'bg-muted/50 opacity-50'}`}>
                        <achievement.icon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
