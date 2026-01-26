import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://grundbuchauszugonline.at",
  "https://www.grundbuchauszugonline.at",
  "https://grundbuchauszugonlineat.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

// Additional pattern matching for Lovable preview URLs
function isLovablePreview(origin: string): boolean {
  return /^https:\/\/[a-f0-9-]+\.lovableproject\.com$/.test(origin) ||
         /^https:\/\/[a-z0-9-]+-preview--[a-f0-9-]+\.lovable\.app$/.test(origin);
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = (ALLOWED_ORIGINS.includes(origin) || isLovablePreview(origin)) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

function isValidOrigin(req: Request): boolean {
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  
  // Check if origin matches allowed domains or is a Lovable preview
  const isValidOriginHeader = ALLOWED_ORIGINS.some(allowed => origin.includes(new URL(allowed).host)) || isLovablePreview(origin);
  const isValidReferer = ALLOWED_ORIGINS.some(allowed => referer.includes(new URL(allowed).host)) || isLovablePreview(referer);
  
  return isValidOriginHeader || isValidReferer;
}

interface SessionData {
  sessionId: string;
  email: string;
  vorname?: string;
  nachname?: string;
  firma?: string;
  wohnsitzland?: string;
  katastralgemeinde?: string;
  grundstuecksnummer?: string;
  grundbuchsgericht?: string;
  bundesland?: string;
  wohnungsHinweis?: string;
  adresse?: string;
  plz?: string;
  ort?: string;
  productName?: string;
  productPrice?: number;
  step?: number;
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate origin to prevent unauthorized access
  if (!isValidOrigin(req)) {
    console.warn("Rejected request from unauthorized origin");
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const sessionData: SessionData = await req.json();

    if (!sessionData.sessionId || !sessionData.email) {
      throw new Error("Session ID and email are required");
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if session already exists
    const { data: existingSession } = await supabase
      .from("abandoned_sessions")
      .select("id, order_completed")
      .eq("session_id", sessionData.sessionId)
      .single();

    // If session exists and order is completed, do nothing
    if (existingSession?.order_completed) {
      return new Response(
        JSON.stringify({ success: true, message: "Order already completed" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const sessionRecord = {
      session_id: sessionData.sessionId,
      email: sessionData.email,
      vorname: sessionData.vorname || null,
      nachname: sessionData.nachname || null,
      firma: sessionData.firma || null,
      wohnsitzland: sessionData.wohnsitzland || null,
      katastralgemeinde: sessionData.katastralgemeinde || null,
      grundstuecksnummer: sessionData.grundstuecksnummer || null,
      grundbuchsgericht: sessionData.grundbuchsgericht || null,
      bundesland: sessionData.bundesland || null,
      wohnungs_hinweis: sessionData.wohnungsHinweis || null,
      adresse: sessionData.adresse || null,
      plz: sessionData.plz || null,
      ort: sessionData.ort || null,
      product_name: sessionData.productName || "Aktueller Grundbuchauszug",
      product_price: sessionData.productPrice || 19.90,
      step: sessionData.step || 2,
      updated_at: new Date().toISOString(),
    };

    if (existingSession) {
      // Update existing session
      const { error } = await supabase
        .from("abandoned_sessions")
        .update(sessionRecord)
        .eq("id", existingSession.id);

      if (error) throw error;
      console.log(`Updated abandoned session: ${sessionData.sessionId}`);
    } else {
      // Create new session with 72-hour expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 72);

      const { error } = await supabase
        .from("abandoned_sessions")
        .insert([{
          ...sessionRecord,
          expires_at: expiresAt.toISOString(),
        }]);

      if (error) throw error;
      console.log(`Created abandoned session: ${sessionData.sessionId}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error tracking abandoned session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
