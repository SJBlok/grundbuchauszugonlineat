import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow PATCH/PUT
  if (req.method !== "PATCH" && req.method !== "PUT") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate API key
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
    const url = new URL(req.url);
    const orderId = url.searchParams.get("id");
    const orderNumber = url.searchParams.get("order_number");

    if (!orderId && !orderNumber) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: id or order_number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    const VALID_STATUSES = ["open", "awaiting_customer", "processed", "cancelled", "deleted"];

    // Whitelist of updatable fields
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
      if (field in body) {
        updates[field] = body[field];
      }
    }

    // Validate status if provided
    if ("status" in updates && !VALID_STATUSES.includes(updates.status as string)) {
      return new Response(
        JSON.stringify({
          error: `Invalid status '${updates.status}'. Must be one of: ${VALID_STATUSES.join(", ")}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate documents if provided
    if ("documents" in updates) {
      if (!Array.isArray(updates.documents)) {
        return new Response(
          JSON.stringify({ error: "documents must be an array" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid fields to update" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let query = supabase
      .from("orders")
      .update(updates)
      .select()
      .single();

    if (orderId) {
      query = supabase.from("orders").update(updates).eq("id", orderId).select().single();
    } else {
      query = supabase.from("orders").update(updates).eq("order_number", orderNumber!).select().single();
    }

    const { data: order, error } = await query;

    if (error) throw error;
    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ order }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
