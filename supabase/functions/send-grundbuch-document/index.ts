import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderData {
  id: string;
  order_number: string;
  katastralgemeinde: string;
  grundstuecksnummer: string;
  email: string;
  vorname: string;
  nachname: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    console.log(`Processing order ${order.order_number} for ${order.email}`);

    // Fetch Grundbuchauszug PDF from Wirtschafts-Compass API
    const wirtschaftsCompassApiKey = Deno.env.get("WIRTSCHAFTSCOMPASS_API_KEY");
    if (!wirtschaftsCompassApiKey) {
      throw new Error("WIRTSCHAFTSCOMPASS_API_KEY not configured");
    }

    // Call Wirtschafts-Compass API to get the Grundbuchauszug
    const apiResponse = await fetch(
      `https://api.wirtschaftscompass.at/v1/grundbuch/auszug?katastralgemeinde=${encodeURIComponent(order.katastralgemeinde)}&grundstuecksnummer=${encodeURIComponent(order.grundstuecksnummer)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${wirtschaftsCompassApiKey}`,
          "Accept": "application/pdf",
        },
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Wirtschafts-Compass API error:", errorText);
      throw new Error(`Failed to fetch Grundbuchauszug: ${apiResponse.status}`);
    }

    // Get the PDF as base64
    const pdfBuffer = await apiResponse.arrayBuffer();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    console.log(`Retrieved Grundbuchauszug PDF (${pdfBuffer.byteLength} bytes)`);

    // Send email via Postmark
    const postmarkApiKey = Deno.env.get("POSTMARK_API_KEY");
    if (!postmarkApiKey) {
      throw new Error("POSTMARK_API_KEY not configured");
    }

    const emailResponse = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": postmarkApiKey,
      },
      body: JSON.stringify({
        From: "info@grundbuchauszug.at",
        To: order.email,
        Subject: `Ihr Grundbuchauszug - Bestellung ${order.order_number}`,
        HtmlBody: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2>Guten Tag ${order.vorname} ${order.nachname},</h2>
              
              <p>vielen Dank für Ihre Bestellung bei grundbuchauszug.at!</p>
              
              <p>Anbei erhalten Sie Ihren angeforderten Grundbuchauszug als PDF-Dokument.</p>
              
              <h3>Bestelldetails:</h3>
              <ul>
                <li><strong>Bestellnummer:</strong> ${order.order_number}</li>
                <li><strong>Katastralgemeinde:</strong> ${order.katastralgemeinde}</li>
                <li><strong>Grundstücksnummer:</strong> ${order.grundstuecksnummer}</li>
              </ul>
              
              <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
              
              <p>Mit freundlichen Grüßen,<br>
              Ihr Team von grundbuchauszug.at</p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">
                Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese Nachricht.
              </p>
            </body>
          </html>
        `,
        TextBody: `
Guten Tag ${order.vorname} ${order.nachname},

vielen Dank für Ihre Bestellung bei grundbuchauszug.at!

Anbei erhalten Sie Ihren angeforderten Grundbuchauszug als PDF-Dokument.

Bestelldetails:
- Bestellnummer: ${order.order_number}
- Katastralgemeinde: ${order.katastralgemeinde}
- Grundstücksnummer: ${order.grundstuecksnummer}

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
Ihr Team von grundbuchauszug.at
        `,
        Attachments: [
          {
            Name: `Grundbuchauszug_${order.katastralgemeinde}_${order.grundstuecksnummer}.pdf`,
            Content: pdfBase64,
            ContentType: "application/pdf",
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Postmark API error:", errorData);
      throw new Error(`Failed to send email: ${emailResponse.status}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult.MessageID);

    // Update order status
    await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResult.MessageID,
        orderNumber: order.order_number 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-grundbuch-document:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
