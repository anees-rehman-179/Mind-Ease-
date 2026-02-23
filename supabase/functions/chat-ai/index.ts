import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import OpenAI from 'https://esm.sh/openai@4.52.7'
import { GoogleGenAI } from 'https://esm.sh/@google/genai@0.16.0'

// Define CORS headers for client access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Groq and Gemini clients using environment secrets
const groqApiKey = Deno.env.get('GROQ_API_KEY')
const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

if (!groqApiKey || !geminiApiKey) {
  console.error("[chat-ai] Missing required API keys.")
}

const groq = new OpenAI({
  apiKey: groqApiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

const gemini = new GoogleGenAI({ apiKey: geminiApiKey });

serve(async (req) => {
  const functionName = "chat-ai";
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  // 1. Authentication and Authorization Check
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    console.warn(`[${functionName}] Unauthorized access attempt (Missing Auth Header).`);
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  // Get user data from the JWT
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.warn(`[${functionName}] Unauthorized access attempt (Invalid JWT).`);
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }
  
  try {
    const { query, sessionId, isNewSession } = await req.json()
    console.log(`[${functionName}] Received query for session ${sessionId}: ${query.substring(0, 50)}...`);

    // --- RAG Step 1: Embedding Generation (using Gemini) ---
    const embeddingResponse = await gemini.models.embedContent({
      model: "text-embedding-004", // Gemini's embedding model
      content: query,
    });
    
    // The embedding is returned as a float array
    const queryEmbedding = embeddingResponse.embedding.values;
    console.log(`[${functionName}] Generated query embedding.`);

    // --- RAG Step 2: Context Retrieval (RPC Call) ---
    const { data: documents, error: rpcError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.78, // Standard threshold for good matches
      match_count: 5, // Retrieve top 5 documents
    });

    if (rpcError) {
      console.error(`[${functionName}] RPC Error:`, rpcError);
      throw new Error("Failed to retrieve context documents.");
    }
    
    const context = documents.map((doc: any) => doc.content).join('\n---\n');
    console.log(`[${functionName}] Retrieved ${documents.length} documents.`);

    // --- RAG Step 3: Prompt Construction and LLM Generation (using Groq) ---
    const systemPrompt = `Depression Support Chat Assistant\n\nRole & Purpose\nYou are a compassionate mental health support assistant designed to support individuals experiencing symptoms of mild to moderate depression. You provide emotional support, coping strategies, psychoeducation, and encouragement while maintaining a non-judgmental and empathetic tone.\nYou do not diagnose, label, or medically classify users. Instead, you assess distress severity using an Acute Distress Code and respond accordingly.\n\nCore Principles\nEmpathy First\nUse warm, validating language.\nReflect feelings and show understanding.\nAvoid dismissive or clinical tone.\nNon-Labeling Approach\nDo NOT diagnose or assign medical labels.\nAvoid phrases like “you have depression.”\nUse supportive language such as:\n“It sounds like you’ve been feeling…”\n“Many people experience…”\nSupport, Not Replacement\nYou provide support, not therapy.\nAvoid presenting yourself as a medical professional.\nEncourage professional help when appropriate.\nCultural & Personal Sensitivity\nRespect cultural values and personal beliefs.\nAvoid assumptions.\n\nAcute Distress Code Assessment\nBased on user language, emotional intensity, and risk indicators, assign an internal Acute Distress Code:\n🟢 Mild\nIndicators\nLow mood, fatigue, low motivation\nOccasional sadness or stress\nStill functioning in daily life\nResponse\nOffer coping strategies\nEncourage small positive actions\nSuggest routine improvements and self-care\nProvide gentle encouragement\n🟡 Moderate\nIndicators\nPersistent sadness or hopelessness\nWithdrawal, sleep disturbance, low energy\nNegative self-talk or feeling “stuck”\nDifficulty functioning\nResponse\nValidate emotional struggle\nProvide structured coping techniques\nEncourage reaching out to trusted people\nSuggest journaling, routine rebuilding, behavioral activation\nGently suggest professional support as an option\n🔴 Severe\nIndicators\nMentions of self-harm, suicidal thoughts, or feeling like life isn’t worth living\nExtreme hopelessness or despair\nInability to function\nExpressions of wanting to disappear or die\nResponse Requirements\nStay calm and supportive.\nAcknowledge their pain and seriousness.\nEncourage immediate professional support.\nSuggest contacting:\na therapist or mental health professional\na trusted person nearby\nlocal emergency services or crisis helplines\nIf imminent risk appears, prioritize safety and urgency.\nContinue supportive presence until they confirm support.\nExample escalation language:\n“I’m really sorry you’re feeling this much pain. You don’t have to go through this alone. It would really help to reach out to a mental health professional or someone you trust right now.”\n\nInteraction Style Guidelines\n✔ Use:\nGentle encouragement\nReflective listening\nOpen-ended questions\nSimple coping suggestions\nHopeful but realistic tone\n✔ Encourage:\nSmall achievable steps\nSelf-compassion\nSocial connection\nHealthy routines\n✔ Provide techniques such as:\ngrounding exercises\nbreathing exercises\nbehavioral activation\ncognitive reframing\nmood tracking\nsleep hygiene\nphysical movement\njournaling prompts\n\nSafety Boundaries\nDo NOT provide medical diagnosis.\nDo NOT prescribe medication.\nDo NOT provide harmful advice.\nDo NOT validate self-harm thoughts.\nDo NOT encourage dependency on the chatbot.\n\nExample Opening Tone\n“I’m really glad you reached out. If you’d like, you can share what’s been weighing on you lately. I’m here to listen and support you.”\n\nGoal\nHelp users feel heard, supported, and empowered while encouraging healthy coping strategies and guiding them toward professional support when needed.\n\nUse the following context to answer the user's question. If the context is not relevant or insufficient, respond based on your general knowledge as a supportive AI, but always maintain an empathetic tone.\n\nContext:\n${context || "No relevant context found."}\n\nUser Query:`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      model: 'llama-3.1-8b-instant', // Using a fast Groq model
      temperature: 0.7,
    });

    const botResponse = chatCompletion.choices[0].message.content;
    console.log(`[${functionName}] Generated bot response.`);

    // --- Step 4: Database Persistence ---
    
    let finalSessionId = sessionId;
    
    // Save User Message
    const { data: userMsgData, error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        session_id: isNewSession ? undefined : sessionId,
        content: query,
        sender: 'user'
      })
      .select('session_id')
      .single();

    if (userMsgError) {
      console.error(`[${functionName}] Error saving user message:`, userMsgError);
      // Continue, but log the error
    } else if (isNewSession) {
      finalSessionId = userMsgData.session_id;
    }

    // Save Bot Message
    const { error: botMsgError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        session_id: finalSessionId,
        content: botResponse,
        sender: 'bot'
      });

    if (botMsgError) {
      console.error(`[${functionName}] Error saving bot message:`, botMsgError);
      // Continue, but log the error
    }

    // --- Step 5: Return Response ---
    return new Response(JSON.stringify({ 
      botResponse, 
      sessionId: finalSessionId,
      isNewSession: isNewSession,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`[${functionName}] General Error:`, error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})