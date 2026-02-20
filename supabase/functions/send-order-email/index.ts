import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const AVAILABLE_TEMPLATES = [
  { id: "order_confirmation", name: "Bestellbevestiging", description: "Versturen na succesvolle betaling", variables: ["customer_name", "order_number", "product_name", "amount"] },
  { id: "awaiting_customer_response", name: "Wachten op klant", description: "Versturen als extra informatie nodig is", variables: ["customer_name", "order_number", "missing_information"] },
  { id: "documents_ready", name: "Documenten klaar", description: "Versturen als document beschikbaar is als bijlage", variables: ["customer_name", "order_number"] },
  { id: "order_completed", name: "Order afgerond", description: "Bevestiging dat de order volledig is afgehandeld", variables: ["customer_name", "order_number"] },
  { id: "order_cancelled", name: "Order geannuleerd", description: "Notificatie bij annulering", variables: ["customer_name", "order_number", "reason"] },
  { id: "abandoned_reminder_1h", name: "Herinnering 1u", description: "Automatische herinnering 1 uur na verlaten bestelformulier", variables: ["vorname", "email", "product_name"] },
  { id: "abandoned_reminder_25h", name: "Herinnering 25u", description: "Tweede herinnering 25 uur na verlaten bestelformulier", variables: ["vorname", "email", "product_name"] },
  { id: "abandoned_reminder_72h", name: "Herinnering 72u", description: "Laatste herinnering 72 uur na verlaten bestelformulier", variables: ["vorname", "email", "product_name"] },
];

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

  // GET: list available templates
  if (req.method === "GET") {
    const url = new URL(req.url);
    if (url.searchParams.get("list_templates") === "true") {
      return new Response(
        JSON.stringify({ templates: AVAILABLE_TEMPLATES }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Use list_templates=true to list templates, or POST to send an email" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();
    const { order_number, order_id, to, subject, html_body, text_body, attachments } = body;

    if (!order_number && !order_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: order_number or order_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!to || !subject || (!html_body && !text_body)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html_body or text_body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the order to validate it exists
    let orderQuery = supabase.from("orders").select("id, order_number, email, vorname, nachname");
    if (order_id) {
      orderQuery = orderQuery.eq("id", order_id);
    } else {
      orderQuery = orderQuery.eq("order_number", order_number);
    }

    const { data: order, error: orderError } = await orderQuery.maybeSingle();

    if (orderError) throw orderError;
    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const postmarkApiKey = Deno.env.get("POSTMARK_API_KEY");
    if (!postmarkApiKey) {
      throw new Error("POSTMARK_API_KEY not configured");
    }

    const emailPayload: Record<string, unknown> = {
      From: "info@grundbuchauszugonline.at",
      To: to,
      Subject: subject,
      MessageStream: "outbound",
    };

    if (html_body) emailPayload.HtmlBody = html_body;
    if (text_body) emailPayload.TextBody = text_body;
    if (attachments && Array.isArray(attachments)) {
      emailPayload.Attachments = attachments;
    }

    const emailResponse = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": postmarkApiKey,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Postmark error: ${JSON.stringify(errorData)}`);
    }

    const emailResult = await emailResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message_id: emailResult.MessageID,
        order_number: order.order_number,
        to,
        subject,
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
