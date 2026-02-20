import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

  const url = new URL(req.url);
  const webhookId = url.searchParams.get("id");

  try {
    // GET - list all webhooks or single webhook
    if (req.method === "GET") {
      if (webhookId) {
        const { data, error } = await supabase
          .from("webhooks")
          .select("id, url, events, active, custom_headers, created_at, updated_at")
          .eq("id", webhookId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          return new Response(
            JSON.stringify({ error: "Webhook not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ webhook: data }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        const { data, error } = await supabase
          .from("webhooks")
          .select("id, url, events, active, custom_headers, created_at, updated_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return new Response(
          JSON.stringify({ webhooks: data }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // POST - create webhook
    if (req.method === "POST") {
      const body = await req.json();
      const { url: webhookUrl, events, secret, active = true, custom_headers = {} } = body;

      if (!webhookUrl || !events?.length || !secret) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: url, events, secret" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const validEvents = [
        "order.created", "order.updated", "order.status_changed", "order.cancelled",
        "payment.received", "payment.failed", "payment.refunded",
        "document.uploaded", "document.sent",
        "moneybird.invoice_created", "moneybird.invoice_paid",
      ];

      const invalidEvents = events.filter((e: string) => !validEvents.includes(e));
      if (invalidEvents.length > 0) {
        return new Response(
          JSON.stringify({ error: `Invalid events: ${invalidEvents.join(", ")}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase
        .from("webhooks")
        .insert({ url: webhookUrl, events, secret, active, custom_headers })
        .select("id, url, events, active, custom_headers, created_at")
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ webhook: data }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PATCH - update webhook
    if (req.method === "PATCH") {
      if (!webhookId) {
        return new Response(
          JSON.stringify({ error: "Missing required parameter: id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      const allowedFields = ["url", "events", "active", "secret", "custom_headers"];
      const updates: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (field in body) updates[field] = body[field];
      }

      if (Object.keys(updates).length === 0) {
        return new Response(
          JSON.stringify({ error: "No valid fields to update" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase
        .from("webhooks")
        .update(updates)
        .eq("id", webhookId)
        .select("id, url, events, active, custom_headers, updated_at")
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return new Response(
          JSON.stringify({ error: "Webhook not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ webhook: data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE - delete webhook
    if (req.method === "DELETE") {
      if (!webhookId) {
        return new Response(
          JSON.stringify({ error: "Missing required parameter: id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("webhooks")
        .delete()
        .eq("id", webhookId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
