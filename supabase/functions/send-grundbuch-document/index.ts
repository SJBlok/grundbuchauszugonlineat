import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Moneybird configuration
const MONEYBIRD_ORG_ID = "475322293910767038";
const MONEYBIRD_WORKFLOW_ID = "476065150855546454";
const MONEYBIRD_DOC_STYLE_ID = "475952776857257711";
const MONEYBIRD_TAX_RATE_ID = "475322457163564407";

interface OrderData {
  id: string;
  order_number: string;
  katastralgemeinde: string;
  grundstuecksnummer: string;
  email: string;
  vorname: string;
  nachname: string;
  firma?: string;
  wohnsitzland: string;
  product_name: string;
  product_price: number;
}

interface MoneybirdContact {
  id: string;
}

interface MoneybirdInvoice {
  id: string;
  invoice_id: string;
}

// Create or find contact in Moneybird
async function findOrCreateMoneybirdContact(
  apiKey: string,
  order: OrderData
): Promise<MoneybirdContact> {
  const baseUrl = `https://moneybird.com/api/v2/${MONEYBIRD_ORG_ID}`;
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  // Search for existing contact by email
  const searchResponse = await fetch(
    `${baseUrl}/contacts.json?query=${encodeURIComponent(order.email)}`,
    { headers }
  );

  if (searchResponse.ok) {
    const contacts = await searchResponse.json();
    if (contacts.length > 0) {
      console.log(`Found existing Moneybird contact: ${contacts[0].id}`);
      return contacts[0];
    }
  }

  // Create new contact
  const contactData = {
    contact: {
      company_name: order.firma || "",
      firstname: order.vorname,
      lastname: order.nachname,
      email: order.email,
      country: order.wohnsitzland === "Österreich" ? "AT" : 
               order.wohnsitzland === "Deutschland" ? "DE" :
               order.wohnsitzland === "Schweiz" ? "CH" : "AT",
    },
  };

  const createResponse = await fetch(`${baseUrl}/contacts.json`, {
    method: "POST",
    headers,
    body: JSON.stringify(contactData),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error("Moneybird contact creation error:", errorText);
    throw new Error(`Failed to create Moneybird contact: ${createResponse.status}`);
  }

  const newContact = await createResponse.json();
  console.log(`Created new Moneybird contact: ${newContact.id}`);
  return newContact;
}

// Create invoice in Moneybird
async function createMoneybirdInvoice(
  apiKey: string,
  contactId: string,
  order: OrderData
): Promise<MoneybirdInvoice> {
  const baseUrl = `https://moneybird.com/api/v2/${MONEYBIRD_ORG_ID}`;
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const invoiceData = {
    sales_invoice: {
      contact_id: contactId,
      workflow_id: MONEYBIRD_WORKFLOW_ID,
      document_style_id: MONEYBIRD_DOC_STYLE_ID,
      reference: order.order_number,
      details_attributes: [
        {
          description: `${order.product_name}\nKG: ${order.katastralgemeinde}\nEZ/GST: ${order.grundstuecksnummer}`,
          price: order.product_price.toString(),
          amount: "1",
          tax_rate_id: MONEYBIRD_TAX_RATE_ID,
        },
      ],
    },
  };

  const createResponse = await fetch(`${baseUrl}/sales_invoices.json`, {
    method: "POST",
    headers,
    body: JSON.stringify(invoiceData),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error("Moneybird invoice creation error:", errorText);
    throw new Error(`Failed to create Moneybird invoice: ${createResponse.status}`);
  }

  const invoice = await createResponse.json();
  console.log(`Created Moneybird invoice: ${invoice.id}`);
  return invoice;
}

// Send invoice via Moneybird
async function sendMoneybirdInvoice(
  apiKey: string,
  invoiceId: string
): Promise<void> {
  const baseUrl = `https://moneybird.com/api/v2/${MONEYBIRD_ORG_ID}`;
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const sendResponse = await fetch(
    `${baseUrl}/sales_invoices/${invoiceId}/send_invoice.json`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        sales_invoice_sending: {
          delivery_method: "Email",
        },
      }),
    }
  );

  if (!sendResponse.ok) {
    const errorText = await sendResponse.text();
    console.error("Moneybird invoice sending error:", errorText);
    throw new Error(`Failed to send Moneybird invoice: ${sendResponse.status}`);
  }

  console.log(`Sent Moneybird invoice: ${invoiceId}`);
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

    // === MONEYBIRD INVOICE CREATION ===
    const moneybirdApiKey = Deno.env.get("MONEYBIRD_API_KEY");
    if (moneybirdApiKey) {
      try {
        console.log("Creating Moneybird invoice...");
        const contact = await findOrCreateMoneybirdContact(moneybirdApiKey, order);
        const invoice = await createMoneybirdInvoice(moneybirdApiKey, contact.id, order);
        await sendMoneybirdInvoice(moneybirdApiKey, invoice.id);
        console.log(`Moneybird invoice ${invoice.id} created and sent successfully`);
      } catch (moneybirdError: any) {
        console.error("Moneybird error (non-blocking):", moneybirdError.message);
        // Continue with document delivery even if Moneybird fails
      }
    } else {
      console.warn("MONEYBIRD_API_KEY not configured, skipping invoice creation");
    }

    // === GRUNDBUCH DOCUMENT DELIVERY ===
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
        From: "info@grundbuchauszugonline.at",
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
              
              <p>Die Rechnung wird Ihnen separat per E-Mail zugestellt.</p>
              
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

Die Rechnung wird Ihnen separat per E-Mail zugestellt.

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
