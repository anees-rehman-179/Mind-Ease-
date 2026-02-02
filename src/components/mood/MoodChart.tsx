import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { MoodEntry } from '@/hooks/useMood';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MoodChartProps {
  entries: MoodEntry[];
}

const moodLabels: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

export function MoodChart({ entries }: MoodChartProps) {
  if (entries.length === 0) {
    return (
      <Card className="card-calm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Mood Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <p>Start tracking your mood to see trends here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort entries by date and format for chart
  const chartData = [...entries]
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .slice(-14) // Last 14 entries
    .map(entry => ({
      date: format(entry.timestamp, 'MMM d'),
      mood: entry.mood,
      fullDate: format(entry.timestamp, 'MMMM d, yyyy'),
    }));

  return (
    <Card className="card-calm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Mood Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                domain={[1, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(value) => moodLabels[value] || value}
                stroke="hsl(var(--muted-foreground))"
                fontSize={14}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm text-muted-foreground">{data.fullDate}</p>
                        <p className="text-lg font-medium">
                          {moodLabels[data.mood]} Mood: {data.mood}/5
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
