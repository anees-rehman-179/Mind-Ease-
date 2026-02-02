import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MoodEntry {
  id: string;
  mood: number; // 1-5 scale
  notes: string;
  timestamp: Date;
}

export function useMood(isGuest: boolean) {
  const { user, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load entries from Supabase on mount or user change
  useEffect(() => {
    const loadEntries = async () => {
      if (isGuest) {
        // Guest mode: use local storage for temporary persistence
        const stored = localStorage.getItem('mindease_mood_logs');
        if (stored) {
          const parsed = JSON.parse(stored);
          setEntries(parsed.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          })));
        } else {
          setEntries([]);
        }
        setIsLoading(false);
        return;
      }

      if (isAuthenticated && user) {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('mood_entries')
          .select('id, mood, notes, timestamp')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (error) {
          console.error('Error loading mood entries:', error);
          toast({
            title: "Error Loading Mood Data",
            description: "Could not retrieve your mood history.",
            variant: "destructive",
          });
          setEntries([]);
        } else {
          const loadedEntries: MoodEntry[] = data.map(entry => ({
            id: entry.id,
            mood: entry.mood,
            notes: entry.notes || '',
            timestamp: new Date(entry.timestamp),
          }));
          setEntries(loadedEntries);
        }
        setIsLoading(false);
      } else if (!isAuthenticated && !isGuest) {
        // Clear entries if logged out and not in guest mode
        setEntries([]);
        setIsLoading(false);
      }
    };

    loadEntries();
  }, [isAuthenticated, isGuest, user]);

  // Persist to localStorage for guest users only
  useEffect(() => {
    if (isGuest) {
      localStorage.setItem('mindease_mood_logs', JSON.stringify(entries));
    }
  }, [entries, isGuest]);


  const addEntry = useCallback(async (mood: number, notes: string) => {
    const newEntry: MoodEntry = {
      id: 'mood_' + Date.now(), // Temporary ID
      mood,
      notes,
      timestamp: new Date(),
    };

    if (isGuest) {
      setEntries(prev => [newEntry, ...prev]);
      return newEntry;
    }

    if (isAuthenticated && user) {
      const { data, error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood,
          notes,
        })
        .select('id, timestamp')
        .single();

      if (error) {
        console.error('Error saving mood entry:', error);
        toast({
          title: "Save Error",
          description: "Could not save mood entry to history.",
          variant: "destructive",
        });
        return newEntry; // Return local entry if save fails
      }
      
      const savedEntry: MoodEntry = {
        ...newEntry,
        id: data.id,
        timestamp: new Date(data.timestamp),
      };
      
      setEntries(prev => [savedEntry, ...prev]);
      return savedEntry;
    }
    
    return newEntry;
  }, [isGuest, isAuthenticated, user]);

  const getRecentEntries = useCallback((days: number = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return entries.filter(entry => entry.timestamp >= cutoff);
  }, [entries]);

  const getAverageMood = useCallback((days: number = 7) => {
    const recent = getRecentEntries(days);
    if (recent.length === 0) return null;
    
    const sum = recent.reduce((acc, entry) => acc + entry.mood, 0);
    return sum / recent.length;
  }, [getRecentEntries]);

  const getStreak = useCallback(() => {
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort entries by date ascending for streak calculation
    const sortedEntries = [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Get unique dates logged
    const loggedDates = new Set(sortedEntries.map(entry => {
      const date = new Date(entry.timestamp);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    }));

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      
      if (loggedDates.has(checkDate.getTime())) {
        streak++;
      } else if (i > 0) {
        // Break if we miss a day, but only if it's not 'today' (i=0)
        // If today is missed, we still check yesterday, etc.
        break;
      }
    }
    
    return streak;
  }, [entries]);

  const clearEntries = useCallback(async () => {
    if (isGuest) {
      setEntries([]);
      localStorage.removeItem('mindease_mood_logs');
      return;
    }

    if (isAuthenticated && user) {
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing mood entries:', error);
        toast({
          title: "Clear Failed",
          description: "Could not clear mood history.",
          variant: "destructive",
        });
        return;
      }
      setEntries([]);
      toast({
        title: "History Cleared",
        description: "Your mood history has been deleted.",
      });
    }
  }, [isGuest, isAuthenticated, user]);

  return {
    entries,
    addEntry,
    getRecentEntries,
    getAverageMood,
    getStreak,
    clearEntries,
    isLoading,
  };
}