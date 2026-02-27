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
  katastralgemeinde: string;
  grundstuecksnummer: string;
  grundbuchsgericht: string;
  bundesland: string;
  wohnungs_hinweis?: string | null;
  adresse?: string | null;
  plz?: string | null;
  ort?: string | null;
  vorname: string;
  nachname: string;
  email: string;
  wohnsitzland: string;
  firma?: string | null;
  product_name?: string;
  product_price?: number;
  fast_delivery?: boolean;
  digital_storage_subscription?: boolean;
  amtliche_signatur?: boolean;
};

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!isValidOrigin(req)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body: CreateOrderBody = await req.json();

    if (!body?.email || !body?.vorname || !body?.nachname) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── Step 1: Create order ──
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
          email: body.email.toLowerCase().trim(),
          wohnsitzland: body.wohnsitzland ?? "Österreich",
          firma: body.firma ?? null,
          product_name: body.product_name ?? "Aktueller Grundbuchauszug",
          product_price: body.product_price ?? 28.90,
          fast_delivery: body.fast_delivery ?? false,
          digital_storage_subscription: body.digital_storage_subscription ?? false,
          amtliche_signatur: body.amtliche_signatur ?? false,
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

    console.log(`[create-order] Order created: ${order.order_number}`);

    if (body.fast_delivery) {
      // ── Fast delivery: process-order handles everything ──
      // process-order → fetches document → sends "Mit Dokument" email + Moneybird invoice
      try {
        console.log(`[create-order] fast_delivery enabled, triggering auto-processing for ${order.order_number}`);
        const processUrl = `${supabaseUrl}/functions/v1/process-order`;
        fetch(processUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ order_id: order.id }),
        }).then(async (res) => {
          const data = await res.json();
          if (data.success) {
            console.log(`[create-order] Auto-processing succeeded for ${order.order_number}`);
          } else {
            console.error(`[create-order] Auto-processing failed: ${data.error}`);
          }
        }).catch((err) => {
          console.error(`[create-order] Auto-processing error: ${err.message}`);
        });
      } catch (triggerErr: any) {
        console.error(`[create-order] Failed to trigger auto-processing: ${triggerErr.message}`);
      }
    } else {
      // ── Manuell: send confirmation email + Moneybird invoice (without document) ──
      try {
        console.log(`[create-order] Manuell order, sending confirmation + Moneybird for ${order.order_number}`);
        const sendDocUrl = `${supabaseUrl}/functions/v1/send-grundbuch-document`;
        fetch(sendDocUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            order_id: order.id,
            // No pdf_base64 → "Manuell" template + Moneybird invoice
          }),
        }).then(async (res) => {
          const data = await res.json();
          if (data.success) {
            console.log(`[create-order] Confirmation + Moneybird sent for ${order.order_number}`);
          } else {
            console.error(`[create-order] Confirmation failed: ${data.error}`);
          }
        }).catch((err) => {
          console.error(`[create-order] Confirmation error: ${err.message}`);
        });
      } catch (triggerErr: any) {
        console.error(`[create-order] Failed to trigger confirmation: ${triggerErr.message}`);
      }
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
