import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This function handles responses for the ETHIOLOTTORY BINGO app
// To call this function without "Unauthorized" errors, ensure you:
// 1. Send 'apikey' header with your Supabase Anon Key
// 2. Or send 'Authorization: Bearer <ANON_KEY>' header
// 3. Or deploy with --no-verify-jwt flag in Supabase CLI

serve(async (req) => {
  // CORS Headers for Frontend access
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const { action, payload } = body

    console.log(`Action received: ${action}`, payload)

    const responseData = { success: true, message: "Response processed smoothly." }

    // Example logic for matching with DB
    if (action === "sync_user") {
      const { telegram_id, data } = payload
      const { error } = await supabaseClient
        .from('profiles')
        .update(data)
        .eq('telegram_id', telegram_id)
      
      if (error) throw error
      responseData.message = "User synced successfully."
    }

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: unknown) {
    console.error("Smooth Responder Error:", error)
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: msg, hint: "Ensure you pass the 'apikey' header with your Anon key or use --no-verify-jwt when deploying." }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
