import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { handleCorsPreFlight, createCorsErrorResponse, corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsResponse = handleCorsPreFlight(req);
  if (corsResponse) return corsResponse;

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error("Authentication required: No authorization header");
      return createCorsErrorResponse("Authentication required", 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Invalid authentication:", authError);
      return createCorsErrorResponse("Invalid authentication", 401);
    }

    const { messages } = await req.json();
    
    // Input validation to prevent abuse and injection attacks
    if (!Array.isArray(messages)) {
      console.error("Invalid request: messages is not an array", { userId: user.id });
      return createCorsErrorResponse("Invalid request format", 400);
    }

    if (messages.length === 0) {
      console.error("Invalid request: empty messages array", { userId: user.id });
      return createCorsErrorResponse("Invalid request", 400);
    }

    if (messages.length > 50) {
      console.error("Invalid request: too many messages", { userId: user.id, count: messages.length });
      return createCorsErrorResponse("Request exceeds limits", 400);
    }

    // Validate each message
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      
      if (!msg.content || typeof msg.content !== 'string') {
        console.error(`Invalid message format at index ${i}`, { userId: user.id });
        return createCorsErrorResponse("Invalid request", 400);
      }
      
      if (msg.content.length > 2000) {
        console.error(`Message too long at index ${i}`, { userId: user.id, length: msg.content.length });
        return createCorsErrorResponse("Request exceeds limits", 400);
      }

      if (!msg.role || (msg.role !== 'user' && msg.role !== 'assistant' && msg.role !== 'system')) {
        console.error(`Invalid message role at index ${i}`, { userId: user.id, role: msg.role });
        return createCorsErrorResponse("Invalid request", 400);
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Logging for monitoring (separated for security)
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    console.log("Processing chat request:", {
      messageCount: messages.length,
      totalCharacters: totalChars,
      timestamp: new Date().toISOString()
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are a friendly design assistant for Green Cabinets, a custom cabinet company. 
            
Your role is to help visitors:
- Browse and discover our gallery of kitchen, bathroom, bedroom, and custom cabinet projects
- Answer questions about our services, materials, and design options
- Provide personalized design suggestions based on their needs
- Help them schedule consultations or get quotes
- Share details about our premium features: custom designs, professional installation, and sustainable materials

Keep responses conversational, helpful, and focused on helping them visualize their dream space. Be enthusiastic about cabinetry and design!` 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded", { userId: user.id });
        return createCorsErrorResponse("Service temporarily unavailable", 429);
      }
      if (response.status === 402) {
        console.error("Payment required", { userId: user.id });
        return createCorsErrorResponse("Service temporarily unavailable", 402);
      }
      const errorText = await response.text();
      console.error("AI gateway error:", { userId: user.id, status: response.status, error: errorText });
      return createCorsErrorResponse("Service error", 500);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return createCorsErrorResponse("Service error. Please try again.", 500);
  }
});
