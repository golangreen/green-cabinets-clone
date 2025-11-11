/**
 * Standard CORS headers for edge functions
 * Use these for any function that needs to be called from the web app
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Handle CORS preflight requests
 * Add this at the start of your edge function handler
 */
export function handleCorsPreFlight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Create a JSON response with CORS headers
 */
export function createCorsResponse(
  data: any,
  status: number = 200
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Create an error response with CORS headers
 */
export function createCorsErrorResponse(
  message: string,
  status: number = 400
): Response {
  return createCorsResponse(
    { error: message },
    status
  );
}
