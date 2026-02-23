import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getRagContext } from '@/lib/ragDocuments';

// OpenRouter API configuration
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const USE_OPENROUTER = !!OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_api_key_here';

// Function to call OpenRouter API (ChatGPT) with RAG context
async function callOpenRouterAPI(query: string, conversationHistory: { role: string; content: string }[]): Promise<string> {
  const systemPrompt = `Depression Support Chat Assistant\n\nRole & Purpose\nYou are a compassionate mental health support assistant designed to support individuals experiencing symptoms of mild to moderate depression. You provide emotional support, coping strategies, psychoeducation, and encouragement while maintaining a non-judgmental and empathetic tone.\nYou do not diagnose, label, or medically classify users. Instead, you assess distress severity using an Acute Distress Code and respond accordingly.\n\nCore Principles\nEmpathy First\nUse warm, validating language.\nReflect feelings and show understanding.\nAvoid dismissive or clinical tone.\nNon-Labeling Approach\nDo NOT diagnose or assign medical labels.\nAvoid phrases like “you have depression.”\nUse supportive language such as:\n“It sounds like you’ve been feeling…”\n“Many people experience…”\nSupport, Not Replacement\nYou provide support, not therapy.\nAvoid presenting yourself as a medical professional.\nEncourage professional help when appropriate.\nCultural & Personal Sensitivity\nRespect cultural values and personal beliefs.\nAvoid assumptions.\n\nAcute Distress Code Assessment\nBased on user language, emotional intensity, and risk indicators, assign an internal Acute Distress Code:\n🟢 Mild\nIndicators\nLow mood, fatigue, low motivation\nOccasional sadness or stress\nStill functioning in daily life\nResponse\nOffer coping strategies\nEncourage small positive actions\nSuggest routine improvements and self-care\nProvide gentle encouragement\n🟡 Moderate\nIndicators\nPersistent sadness or hopelessness\nWithdrawal, sleep disturbance, low energy\nNegative self-talk or feeling “stuck”\nDifficulty functioning\nResponse\nValidate emotional struggle\nProvide structured coping techniques\nEncourage reaching out to trusted people\nSuggest journaling, routine rebuilding, behavioral activation\nGently suggest professional support as an option\n🔴 Severe\nIndicators\nMentions of self-harm, suicidal thoughts, or feeling like life isn’t worth living\nExtreme hopelessness or despair\nInability to function\nExpressions of wanting to disappear or die\nResponse Requirements\nStay calm and supportive.\nAcknowledge their pain and seriousness.\nEncourage immediate professional support.\nSuggest contacting:\na therapist or mental health professional\na trusted person nearby\nlocal emergency services or crisis helplines\nIf imminent risk appears, prioritize safety and urgency.\nContinue supportive presence until they confirm support.\nExample escalation language:\n“I’m really sorry you’re feeling this much pain. You don’t have to go through this alone. It would really help to reach out to a mental health professional or someone you trust right now.”\n\nInteraction Style Guidelines\n✔ Use:\nGentle encouragement\nReflective listening\nOpen-ended questions\nSimple coping suggestions\nHopeful but realistic tone\n✔ Encourage:\nSmall achievable steps\nSelf-compassion\nSocial connection\nHealthy routines\n✔ Provide techniques such as:\ngrounding exercises\nbreathing exercises\nbehavioral activation\ncognitive reframing\nmood tracking\nsleep hygiene\nphysical movement\njournaling prompts\n\nSafety Boundaries\nDo NOT provide medical diagnosis.\nDo NOT prescribe medication.\nDo NOT provide harmful advice.\nDo NOT validate self-harm thoughts.\nDo NOT encourage dependency on the chatbot.\n\nExample Opening Tone\n“I’m really glad you reached out. If you’d like, you can share what’s been weighing on you lately. I’m here to listen and support you.”\n\nGoal\nHelp users feel heard, supported, and empowered while encouraging healthy coping strategies and guiding them toward professional support when needed.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'MindEase',
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
}

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  content: "Hello! I'm your MindEase companion. How are you feeling today?",
  sender: 'bot',
  timestamp: new Date(),
};

// Use a constant for the temporary ID prefix
const TEMP_SESSION_PREFIX = 'temp_session_';

export function useChat() {
  const { user, isAuthenticated, isGuest } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (isGuest || !user) return;
    
    // Fetch all messages for the user, ordered by timestamp
    const { data, error } = await supabase
      .from('chat_messages')
      .select('session_id, content, timestamp')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error("Error fetching sessions:", error);
      return;
    }

    // Group messages by session_id and use the first message as the title
    const sessionMap = new Map<string, ChatSession>();
    data.forEach(msg => {
      if (!sessionMap.has(msg.session_id)) {
        sessionMap.set(msg.session_id, {
          id: msg.session_id,
          title: msg.content.substring(0, 30) + (msg.content.length > 30 ? '...' : ''),
          timestamp: new Date(msg.timestamp)
        });
      }
    });

    // Filter out any temporary sessions if they exist (shouldn't happen if saved correctly)
    const finalSessions = Array.from(sessionMap.values())
      .filter(s => !s.id.startsWith(TEMP_SESSION_PREFIX))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort descending by time

    setSessions(finalSessions);
  }, [isGuest, user]);

  const loadSession = useCallback(async (sessionId: string) => {
    if (isGuest) return;
    
    setIsTyping(true);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Could not load chat.", variant: "destructive" });
    } else {
      setMessages(data.map(m => ({
        id: m.id,
        content: m.content,
        sender: m.sender as 'user' | 'bot',
        timestamp: new Date(m.timestamp)
      })));
      setCurrentSessionId(sessionId);
    }
    setIsTyping(false);
  }, [isGuest]);

  const startNewChat = useCallback(() => {
    // Use a temporary ID for new sessions until the first message is sent and saved
    setCurrentSessionId(TEMP_SESSION_PREFIX + Date.now());
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSessions();
      // Only start a new chat if there are no messages (first time)
      if (messages.length === 0 && !currentSessionId) {
        startNewChat();
      }
    } else if (isGuest) {
      // Guest mode: show welcome message if no messages exist
      if (messages.length === 0) {
        setMessages([welcomeMessage]);
        setCurrentSessionId(TEMP_SESSION_PREFIX + Date.now());
      }
    }
  }, [isAuthenticated, user, isGuest]);

  // Fetch sessions on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSessions();
    }
  }, [isAuthenticated, user, fetchSessions]);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentSessionId || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), content, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    let isNewSession = currentSessionId.startsWith(TEMP_SESSION_PREFIX);

    // Use OpenRouter API for both guest and authenticated users
    if (USE_OPENROUTER || isGuest) {
      setIsTyping(true);
      try {
        // Build conversation history from recent messages (last 10)
        const recentMessages = messages.slice(-10).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.content
        }));
        
        const botResponse = await callOpenRouterAPI(content, recentMessages);
        
        const botMsg: ChatMessage = { 
          id: (Date.now() + 1).toString(), 
          content: botResponse, 
          sender: 'bot', 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, botMsg]);
        
        // Save to database if user is authenticated (not guest)
        if (user && !isGuest) {
          try {
            let actualSessionId = currentSessionId;
            
            if (isNewSession) {
              const { data: userMsgData, error: userMsgError } = await supabase
                .from('chat_messages')
                .insert({
                  user_id: user.id,
                  content: content,
                  sender: 'user'
                })
                .select('session_id')
                .single();
              
              if (!userMsgError && userMsgData) {
                actualSessionId = userMsgData.session_id;
                setCurrentSessionId(actualSessionId);
                
                const newSession: ChatSession = {
                  id: actualSessionId,
                  title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
                  timestamp: new Date(),
                };
                setSessions(prev => [newSession, ...prev]);
              }
            } else {
              await supabase
                .from('chat_messages')
                .insert({
                  user_id: user.id,
                  session_id: actualSessionId,
                  content: content,
                  sender: 'user'
                });
            }
            
            // Save bot message
            await supabase
              .from('chat_messages')
              .insert({
                user_id: user.id,
                session_id: actualSessionId,
                content: botResponse,
                sender: 'bot'
              });
          } catch (dbError) {
            console.warn('Could not save to database:', dbError);
          }
        }
      } catch (error: any) {
        console.error('OpenRouter API Error:', error);
        toast({ 
          title: "API Error", 
          description: error.message || "Could not get response from OpenRouter.", 
          variant: "destructive" 
        });
      } finally {
        setIsTyping(false);
      }
      return;
    }

    // Authenticated user: Use Edge Function for RAG and persistence
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          query: content,
          sessionId: currentSessionId,
          isNewSession: isNewSession,
        },
      });

      if (error) {
        console.error('Edge Function Error:', error);
        const errorMessage = error.message || 'Could not save message.';
        
        // Fallback: Save to database directly and provide a simple response
        console.log('Using fallback: saving message directly to database');
        
        try {
          // Determine the actual session ID to use
          let actualSessionId = currentSessionId;
          
          if (isNewSession) {
            // For new sessions, insert the user message and let the database generate a session_id
            const { data: userMsgData, error: userMsgError } = await supabase
              .from('chat_messages')
              .insert({
                user_id: user!.id,
                content: content,
                sender: 'user'
              })
              .select('session_id')
              .single();
            
            if (userMsgError) throw userMsgError;
            actualSessionId = userMsgData.session_id;
            setCurrentSessionId(actualSessionId);
            
            // Add to sessions list
            const newSession: ChatSession = {
              id: actualSessionId,
              title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
              timestamp: new Date(),
            };
            setSessions(prev => [newSession, ...prev]);
          } else {
            // For existing sessions, just save the user message
            const { error: userMsgError } = await supabase
              .from('chat_messages')
              .insert({
                user_id: user!.id,
                session_id: actualSessionId,
                content: content,
                sender: 'user'
              });
            
            if (userMsgError) throw userMsgError;
          }
          
          // Generate a simple fallback response
          const fallbackResponse = "I apologize, but I'm having trouble connecting to my AI service. However, I'm here to support you. Could you tell me more about how you're feeling?";
          
          // Save bot message
          const { error: botMsgError } = await supabase
            .from('chat_messages')
            .insert({
              user_id: user!.id,
              session_id: actualSessionId,
              content: fallbackResponse,
              sender: 'bot'
            });
          
          if (botMsgError) throw botMsgError;
          
          // Update UI
          const botMsg: ChatMessage = { 
            id: (Date.now() + 1).toString(), 
            content: fallbackResponse, 
            sender: 'bot', 
            timestamp: new Date() 
          };
          setMessages(prev => [...prev, botMsg]);
          
          toast({ 
            title: "Limited Mode", 
            description: "AI service unavailable. Using fallback responses.", 
            variant: "default" 
          });
          
        } catch (fallbackError: any) {
          console.error('Fallback also failed:', fallbackError);
          toast({ title: "Error", description: errorMessage, variant: "destructive" });
        }
        
        setIsTyping(false);
        return;
      }

      if (!data) {
        console.error('No data returned from Edge Function');
        toast({ title: "Error", description: "No response from AI service.", variant: "destructive" });
        setIsTyping(false);
        return;
      }

      console.log('Edge Function Response:', data);
      
      // The response data is already the object with botResponse, sessionId, etc.
      const { botResponse, sessionId: returnedSessionId, isNewSession: wasNewSession } = data as { botResponse: string; sessionId: string; isNewSession: boolean };

      // Update messages with the bot's response
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), content: botResponse, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);

      // If it was a new session, update the current ID and the sessions list
      if (wasNewSession && returnedSessionId) {
        setCurrentSessionId(returnedSessionId);
        const newSession: ChatSession = {
          id: returnedSessionId,
          title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
          timestamp: new Date(),
        };
        setSessions(prev => [newSession, ...prev]);
      }
    } catch (e: any) {
      console.error('Network or parsing error:', e);
      toast({ title: "Network Error", description: "Could not connect to the AI service.", variant: "destructive" });
    } finally {
      setIsTyping(false);
    }
  }, [currentSessionId, isGuest, user, fetchSessions, isTyping]);

  return { messages, sessions, isTyping, sendMessage, startNewChat, loadSession };
}