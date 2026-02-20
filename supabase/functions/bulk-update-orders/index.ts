import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const apiKey = req.headers.get("x-api-key");
  const validApiKey = Deno.env.get("PORTAL_API_KEY");

  if (!apiKey || apiKey !== validApiKey) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: invalid or missing API key" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();
    const { order_numbers, order_ids, ...updateFields } = body;

    if (!order_numbers?.length && !order_ids?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required field: order_numbers or order_ids (array)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allowedFields = [
      "status",
      "payment_status",
      "processing_status",
      "processing_notes",
      "moneybird_invoice_id",
      "moneybird_invoice_status",
      "documents",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in updateFields) {
        updates[field] = updateFields[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid fields to update" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<{ identifier: string; success: boolean; error?: string }> = [];
    const identifiers: string[] = order_numbers || order_ids;
    const field = order_numbers ? "order_number" : "id";

    for (const identifier of identifiers) {
      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq(field, identifier);

      if (error) {
        results.push({ identifier, success: false, error: error.message });
      } else {
        results.push({ identifier, success: true });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        updated: successCount,
        failed: failCount,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
