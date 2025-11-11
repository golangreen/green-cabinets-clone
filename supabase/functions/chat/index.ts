import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCorsPreFlight, createCorsErrorResponse, corsHeaders } from "../_shared/cors.ts";
import { createAuthenticatedClient } from "../_shared/supabase.ts";
import { createLogger, generateRequestId } from "../_shared/logger.ts";
import { ValidationError, withErrorHandling } from "../_shared/errors.ts";

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCorsPreFlight(req);
  if (corsResponse) return corsResponse;

  // Initialize logger
  const requestId = generateRequestId();
  const logger = createLogger({ functionName: 'chat', requestId });
  logger.info('Chat request received');

  // Verify authentication
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    logger.warn('Authentication required: No authorization header');
    return createCorsErrorResponse("Authentication required", 401);
  }

  const supabase = createAuthenticatedClient(authHeader);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    logger.warn('Invalid authentication', { error: authError });
    return createCorsErrorResponse("Invalid authentication", 401);
  }

  logger.info('User authenticated', { userId: user.id });

  const { messages } = await req.json();
  
  // Input validation to prevent abuse and injection attacks
  if (!Array.isArray(messages)) {
    logger.error('Invalid request: messages is not an array', { userId: user.id });
    throw new ValidationError("Invalid request format");
  }

  if (messages.length === 0) {
    logger.error('Invalid request: empty messages array', { userId: user.id });
    throw new ValidationError("Invalid request");
  }

  if (messages.length > 50) {
    logger.error('Invalid request: too many messages', { userId: user.id, count: messages.length });
    throw new ValidationError("Request exceeds limits");
  }

  // Validate each message
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (!msg.content || typeof msg.content !== 'string') {
      logger.error(`Invalid message format at index ${i}`, { userId: user.id });
      throw new ValidationError("Invalid request");
    }
    
    if (msg.content.length > 2000) {
      logger.error(`Message too long at index ${i}`, { userId: user.id, length: msg.content.length });
      throw new ValidationError("Request exceeds limits");
    }

    if (!msg.role || (msg.role !== 'user' && msg.role !== 'assistant' && msg.role !== 'system')) {
      logger.error(`Invalid message role at index ${i}`, { userId: user.id, role: msg.role });
      throw new ValidationError("Invalid request");
    }
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  // Logging for monitoring
  const totalChars = messages.reduce((sum: number, msg: any) => sum + msg.content.length, 0);
  logger.info('Processing chat request', {
    userId: user.id,
    messageCount: messages.length,
    totalCharacters: totalChars,
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
      logger.warn('Rate limit exceeded from AI gateway', { userId: user.id });
      return createCorsErrorResponse("Service temporarily unavailable", 429);
    }
    if (response.status === 402) {
      logger.warn('Payment required from AI gateway', { userId: user.id });
      return createCorsErrorResponse("Service temporarily unavailable", 402);
    }
    const errorText = await response.text();
    logger.error('AI gateway error', { userId: user.id, status: response.status, error: errorText });
    return createCorsErrorResponse("Service error", 500);
  }

  logger.info('Chat response successful', { userId: user.id });
  return new Response(response.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
};

serve(withErrorHandling(handler, (msg, error) => {
  const logger = createLogger({ functionName: 'chat' });
  logger.error(msg, error);
}));
