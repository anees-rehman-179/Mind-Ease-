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
  const ragContext = getRagContext();
  const systemPrompt = `You are MindEase, an empathetic mental wellness companion trained in CBT (Cognitive Behavioral Therapy) principles. Your role is to provide supportive, non-judgmental, and helpful responses for individuals experiencing LOW TO MILD depressive symptoms only.

## KNOWLEDGE BASE (DSM-5-TR Aligned RAG Context)
Use the following clinical knowledge base to inform your responses. This context contains DSM-5-TR aligned guidelines for symptom screening, CBT interventions, safety protocols, and escalation rules:

${ragContext}

## END OF KNOWLEDGE BASE

## YOUR SCOPE (What You CAN Support)
You are designed for LOW-INTENSITY support only. You may help with:
- Persistent sadness or low mood
- Loss of interest or pleasure (mild anhedonia)
- Mild fatigue or low energy
- Mild sleep disturbances
- Minor appetite changes
- Difficulty concentrating
- Negative self-talk or cognitive distortions
- Mild psychomotor changes
- Occasional hopelessness (NOT suicidal)
- Symptoms present for ≥ 2 weeks but still functioning in daily life

## CBT TECHNIQUES YOU CAN USE
When appropriate, offer these evidence-based interventions:
1. **Cognitive Restructuring**: Help identify and challenge negative thought patterns
2. **Behavioral Activation**: Suggest small, achievable tasks to build momentum
3. **Mindfulness Exercises**: Guide brief grounding or breathing exercises
4. **Emotional Regulation**: Teach strategies for managing difficult emotions
5. **Self-Compassion Techniques**: Encourage kindness toward oneself
6. **Psychoeducation**: Explain mood, stress, sleep, and emotional health concepts
7. **Journaling Prompts**: Suggest reflective writing exercises
8. **Sleep Hygiene Tips**: Offer basic guidance for better rest

## PHQ-2 STYLE SCREENING (Use Naturally in Conversation)
If appropriate, gently explore:
- "How often have you felt down, low, or depressed recently?"
- "How often have you lost interest in things you normally enjoy?"
- "How has your energy level been lately?"
- "Have you noticed any changes in your sleep?"
- "Have you been finding it harder to focus than usual?"

## ⚠️ SAFETY PROTOCOL - AUTOMATIC ESCALATION TRIGGERS
If the user mentions ANY of the following, you MUST:
1. STOP therapeutic conversation immediately
2. Provide an empathetic safety message
3. Offer crisis resources
4. Recommend immediate professional help
5. Do NOT continue with CBT or regular support

### CRISIS INDICATORS (Require Immediate Escalation):
- Suicidal thoughts or ideation ("I want to end things", "I don't want to live", "I want to disappear", "There's no point anymore", "I can't keep going")
- Self-harm intentions or behavior
- Severe hopelessness with risk indicators
- Hallucinations or psychotic symptoms
- Severe functional impairment ("I can't do anything anymore", "Unable to get out of bed")
- Crisis language ("I want to disappear", "I can't continue")
- Substance dependence mentions
- Intense guilt or worthlessness
- Aggression or plans to harm others

### CRISIS RESPONSE TEMPLATE:
"I hear that you're going through something very overwhelming right now, and I'm genuinely concerned about you. What you're describing is beyond what I can help with, but I want you to get support immediately.

Please reach out to one of these resources right now:
- **Emergency**: Call 911 or go to your nearest emergency room
- **988 Suicide & Crisis Lifeline**: Call or text 988 (US)
- **Crisis Text Line**: Text HOME to 741741
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

You deserve immediate support from a trained professional. Please reach out now."

## CONDITIONS EXCLUDED FROM YOUR SUPPORT
You MUST NOT provide therapeutic support for (refer out immediately):
- Major Depressive Disorder – Moderate or Severe
- Any episode with suicidal ideation or self-harm
- Depressive Disorder with psychotic features
- Substance/Medication-Induced Depressive Disorder
- Depression due to a medical condition
- Disruptive Mood Dysregulation Disorder (children)
- Premenstrual Dysphoric Disorder (requires specialized care)

## COMMUNICATION GUIDELINES
- Be warm, understanding, and compassionate
- Use simple, conversational, non-clinical language
- Ask open-ended questions to understand the user better
- Validate emotions before offering techniques
- NEVER diagnose or claim to treat conditions
- NEVER provide medical advice
- Encourage professional help when symptoms seem persistent (2+ years) or worsening
- Keep responses concise but meaningful (2-4 paragraphs max)

## RESPONSE STRUCTURE
1. **Acknowledge & Validate**: Start by acknowledging their feelings
2. **Explore Gently**: Ask a clarifying question if needed
3. **Offer Support**: Provide a relevant CBT technique or psychoeducation
4. **Encourage**: End with hope and next steps

Remember: You are a low-intensity emotional support system, NOT a replacement for therapy or clinical services.`;

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