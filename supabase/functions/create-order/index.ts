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
  return (
    /^https:\/\/[a-f0-9-]+\.lovableproject\.com$/.test(origin) ||
    /^https:\/\/[a-z0-9-]+-preview--[a-f0-9-]+\.lovable\.app$/.test(origin)
  );
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = (ALLOWED_ORIGINS.includes(origin) || isLovablePreview(origin))
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

function isValidOrigin(req: Request): boolean {
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";

  const isValidOriginHeader =
    ALLOWED_ORIGINS.some((allowed) => origin.includes(new URL(allowed).host)) ||
    isLovablePreview(origin);
  const isValidReferer =
    ALLOWED_ORIGINS.some((allowed) => referer.includes(new URL(allowed).host)) ||
    isLovablePreview(referer);

  return isValidOriginHeader || isValidReferer;
}

type CreateOrderBody = {
  // property
  katastralgemeinde: string;
  grundstuecksnummer: string;
  grundbuchsgericht: string;
  bundesland: string;
  wohnungs_hinweis?: string | null;
  adresse?: string | null;
  plz?: string | null;
  ort?: string | null;

  // applicant
  vorname: string;
  nachname: string;
  email: string;
  wohnsitzland: string;
  firma?: string | null;

  // optional
  product_name?: string;
  product_price?: number;
};

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate origin to prevent unauthorized access
    if (!isValidOrigin(req)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body: CreateOrderBody = await req.json();

    // Minimal validation (avoid breaking existing UX)
    if (!body?.email || !body?.vorname || !body?.nachname) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Use service role to bypass RLS for order creation
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          katastralgemeinde: body.katastralgemeinde ?? "",
          grundstuecksnummer: body.grundstuecksnummer ?? "",
          grundbuchsgericht: body.grundbuchsgericht ?? "",
          bundesland: body.bundesland ?? "",
          wohnungs_hinweis: body.wohnungs_hinweis ?? null,
          adresse: body.adresse ?? null,
          plz: body.plz ?? null,
          ort: body.ort ?? null,
          vorname: body.vorname,
          nachname: body.nachname,
          email: body.email,
          wohnsitzland: body.wohnsitzland ?? "Österreich",
          firma: body.firma ?? null,
          product_name: body.product_name ?? "Aktueller Grundbuchauszug",
          product_price: body.product_price ?? 19.9,
          // required by schema; overwritten by trigger
          order_number: "PENDING",
        },
      ])
      .select("id, order_number")
      .single();

    if (error) {
      console.error("Create order error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ id: order.id, order_number: order.order_number }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error: any) {
    console.error("Error in create-order:", error);
    return new Response(
      JSON.stringify({ error: error?.message ?? "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
