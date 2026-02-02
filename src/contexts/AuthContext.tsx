import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface Profile {
  first_name: string | null;
  last_name: string | null;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  supabaseUser: SupabaseUser;
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_KEY = 'mindease_guest_mode';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isGuest = user?.isGuest ?? false;
  const isAuthenticated = !!session && !isGuest;

  // Helper to fetch profile data and set AppUser state
  const fetchProfileAndSetUser = useCallback(async (supabaseUser: SupabaseUser) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', supabaseUser.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // Fallback name if profile fails
      const name = supabaseUser.email?.split('@')[0] || 'User';
      setUser({
        id: supabaseUser.id,
        name,
        email: supabaseUser.email || '',
        isGuest: false,
        supabaseUser,
      });
      return;
    }

    const name = [profileData.first_name, profileData.last_name].filter(Boolean).join(' ') || supabaseUser.email?.split('@')[0] || 'User';

    setUser({
      id: supabaseUser.id,
      name,
      email: supabaseUser.email || '',
      isGuest: false,
      supabaseUser,
    });
  }, []);

  // 1. Initial load and session listener
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase session error:', error);
      }

      if (session) {
        setSession(session);
        await fetchProfileAndSetUser(session.user);
      } else if (localStorage.getItem(GUEST_KEY) === 'true') {
        loginAsGuest();
      }
      setIsLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_IN' && currentSession) {
        setSession(currentSession);
        fetchProfileAndSetUser(currentSession.user);
        localStorage.removeItem(GUEST_KEY);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        localStorage.removeItem(GUEST_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfileAndSetUser]);

  // 2. Auth methods
  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const [firstName, ...rest] = name.split(' ');
    const lastName = rest.join(' ');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) throw new Error(error.message);
  }, []);

  const loginAsGuest = useCallback(() => {
    const guestUser: AppUser = {
      id: 'guest_' + Date.now(),
      name: 'Guest',
      email: '',
      isGuest: true,
      supabaseUser: {} as SupabaseUser,
    };
    
    setUser(guestUser);
    setSession(null);
    localStorage.setItem(GUEST_KEY, 'true');
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(GUEST_KEY);
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isGuest,
        isLoading,
        login,
        signup,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}