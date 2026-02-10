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
  grundbuchsgericht: string;
  bundesland: string;
  wohnungs_hinweis?: string;
  adresse?: string;
  plz?: string;
  ort?: string;
  email: string;
  vorname: string;
  nachname: string;
  firma?: string;
  wohnsitzland: string;
  product_name: string;
  product_price: number;
  created_at: string;
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
      const existingContact = contacts[0];
      console.log(`Found existing Moneybird contact: ${existingContact.id}`);
      
      // Update the contact to ensure email and send_invoices_to_email are set correctly
      const updateResponse = await fetch(
        `${baseUrl}/contacts/${existingContact.id}.json`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            contact: {
              email: order.email,
              send_invoices_to_email: order.email,
            },
          }),
        }
      );
      
      if (updateResponse.ok) {
        console.log(`Updated Moneybird contact ${existingContact.id} with email: ${order.email}`);
      } else {
        console.warn(`Failed to update contact email, continuing anyway`);
      }
      
      return existingContact;
    }
  }

  // Create new contact with email and send_invoices_to_email
  const contactData = {
    contact: {
      company_name: order.firma || "",
      firstname: order.vorname,
      lastname: order.nachname,
      email: order.email,
      send_invoices_to_email: order.email,
      country: order.wohnsitzland === "Österreich" ? "AT" : 
               order.wohnsitzland === "Deutschland" ? "DE" :
               order.wohnsitzland === "Schweiz" ? "CH" : "AT",
    },
  };

  console.log(`Creating new Moneybird contact with email: ${order.email}`);

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

  // Price is inclusive of VAT (€29.90 total)
  // Use prices_are_incl_tax: true so Moneybird calculates the net amount correctly
  const invoiceData = {
    sales_invoice: {
      contact_id: contactId,
      workflow_id: MONEYBIRD_WORKFLOW_ID,
      document_style_id: MONEYBIRD_DOC_STYLE_ID,
      reference: order.order_number,
      prices_are_incl_tax: true,
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
  invoiceId: string,
  emailAddress: string
): Promise<void> {
  const baseUrl = `https://moneybird.com/api/v2/${MONEYBIRD_ORG_ID}`;
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  console.log(`Sending Moneybird invoice ${invoiceId} to email: ${emailAddress}`);

  const sendResponse = await fetch(
    `${baseUrl}/sales_invoices/${invoiceId}/send_invoice.json`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        sales_invoice_sending: {
          delivery_method: "Email",
          email_address: emailAddress,
          email_message: `Sehr geehrte Damen und Herren,\n\nanbei erhalten Sie Ihre Rechnung.\n\nMit freundlichen Grüßen,\nIhr GrundbuchauszugOnline.at Team`,
        },
      }),
    }
  );

  if (!sendResponse.ok) {
    const errorText = await sendResponse.text();
    console.error("Moneybird invoice sending error:", errorText);
    throw new Error(`Failed to send Moneybird invoice: ${sendResponse.status}`);
  }

  console.log(`Sent Moneybird invoice: ${invoiceId} to ${emailAddress}`);
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate origin to prevent unauthorized access
    if (!isValidOrigin(req)) {
      console.warn("Rejected request from unauthorized origin");
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { orderId, sessionId } = await req.json();

    if (!orderId) {
      throw new Error("Order ID is required");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify order exists and is pending (prevents re-processing)
    const { data: orderCheck, error: checkError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .single();
    
    if (checkError || !orderCheck) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    if (orderCheck.status === "completed") {
      return new Response(
        JSON.stringify({ error: "Order already processed", order_number: orderCheck.id }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark abandoned session as completed by sessionId (if provided)
    if (sessionId) {
      const { error: updateError } = await supabase
        .from("abandoned_sessions")
        .update({ order_completed: true })
        .eq("session_id", sessionId);
      
      if (updateError) {
        console.warn("Failed to mark session as completed:", updateError.message);
      } else {
        console.log(`Marked session ${sessionId} as completed`);
      }
    }

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

    // Also mark any other abandoned sessions with the same email as completed
    // This prevents reminders if user starts a new session but completes the order
    const { error: emailUpdateError } = await supabase
      .from("abandoned_sessions")
      .update({ order_completed: true })
      .eq("email", order.email)
      .eq("order_completed", false);
    
    if (emailUpdateError) {
      console.warn("Failed to mark email sessions as completed:", emailUpdateError.message);
    } else {
      console.log(`Marked all abandoned sessions for ${order.email} as completed`);
    }

    // === MONEYBIRD INVOICE CREATION ===
    const moneybirdApiKey = Deno.env.get("MONEYBIRD_API_KEY");
    if (moneybirdApiKey) {
      try {
        console.log("Creating Moneybird invoice...");
        const contact = await findOrCreateMoneybirdContact(moneybirdApiKey, order);
        const invoice = await createMoneybirdInvoice(moneybirdApiKey, contact.id, order);
        await sendMoneybirdInvoice(moneybirdApiKey, invoice.id, order.email);
        console.log(`Moneybird invoice ${invoice.id} created and sent successfully`);
      } catch (moneybirdError: any) {
        console.error("Moneybird error (non-blocking):", moneybirdError.message);
        // Continue with document delivery even if Moneybird fails
      }
    } else {
      console.warn("MONEYBIRD_API_KEY not configured, skipping invoice creation");
    }

    // === GRUNDBUCH DOCUMENT DELIVERY ===
    // Try to fetch Grundbuchauszug PDF from Wirtschafts-Compass API
    let pdfBase64: string | null = null;
    let documentFetchError: string | null = null;
    
    const wirtschaftsCompassApiKey = Deno.env.get("WIRTSCHAFTSCOMPASS_API_KEY");
    if (!wirtschaftsCompassApiKey) {
      console.warn("WIRTSCHAFTSCOMPASS_API_KEY not configured, skipping document fetch");
      documentFetchError = "API key not configured";
    } else {
      try {
        const baseUrl = "https://api.wirtschaftscompass.at/landregister";
        const authHeaders = {
          "Authorization": `Bearer ${wirtschaftsCompassApiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        };

        // Parse the grundstuecksnummer - it contains KG number and EZ
        const kgNumber = order.katastralgemeinde.match(/\d+/)?.[0] || order.katastralgemeinde;
        const ezNumber = order.grundstuecksnummer;

        console.log(`Fetching Grundbuchauszug for KG: ${kgNumber}, EZ: ${ezNumber}`);

        // Step 1: Create/retrieve a document reference via POST /v1/excerpts/land-register-excerpt
        const excerptResponse = await fetch(
          `${baseUrl}/v1/excerpts/land-register-excerpt`,
          {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
              kg: kgNumber,
              ez: ezNumber,
              validity: "FETCH_IF_NOT_AVAILABLE",
            }),
          }
        );

        if (!excerptResponse.ok) {
          const errorText = await excerptResponse.text();
          console.error("Wirtschafts-Compass excerpt creation error:", errorText);
          throw new Error(`Failed to create excerpt: ${excerptResponse.status}`);
        }

        const excerptData = await excerptResponse.json();
        const documentReference = excerptData.documentReference || excerptData.document_reference || excerptData.id;
        
        if (!documentReference) {
          console.error("Wirtschafts-Compass response:", JSON.stringify(excerptData));
          throw new Error("No document reference returned");
        }

        console.log(`Got document reference: ${documentReference}`);

        // Step 2: Download the PDF
        const pdfResponse = await fetch(
          `${baseUrl}/v1/excerpts/${documentReference}/land-register-excerpt/pdf`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${wirtschaftsCompassApiKey}`,
              "Accept": "application/pdf",
            },
          }
        );

        if (!pdfResponse.ok) {
          const errorText = await pdfResponse.text();
          console.error("Wirtschafts-Compass PDF download error:", errorText);
          throw new Error(`Failed to download PDF: ${pdfResponse.status}`);
        }

        // Get the PDF as base64
        const pdfBuffer = await pdfResponse.arrayBuffer();
        pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
        console.log(`Retrieved Grundbuchauszug PDF (${pdfBuffer.byteLength} bytes)`);
      } catch (docError: any) {
        console.error("Document fetch error (non-blocking):", docError.message);
        documentFetchError = docError.message;
      }
    }

    // Send email via Postmark
    const postmarkApiKey = Deno.env.get("POSTMARK_API_KEY");
    if (!postmarkApiKey) {
      throw new Error("POSTMARK_API_KEY not configured");
    }

    // Prepare email content based on whether we have the document
    const hasDocument = pdfBase64 !== null;
    const documentMessage = hasDocument 
      ? "<p><strong>Anbei erhalten Sie Ihren angeforderten Grundbuchauszug als PDF-Dokument.</strong></p>"
      : `<div style="background-color: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;"><strong>⚠️ Wichtiger Hinweis:</strong> Das Dokument konnte nicht automatisch abgerufen werden. Wir werden Ihnen den Grundbuchauszug schnellstmöglich manuell zusenden.</p>
        </div>`;
    
    const documentTextMessage = hasDocument
      ? "Anbei erhalten Sie Ihren angeforderten Grundbuchauszug als PDF-Dokument."
      : "WICHTIGER HINWEIS: Das Dokument konnte nicht automatisch abgerufen werden. Wir werden Ihnen den Grundbuchauszug schnellstmöglich manuell zusenden.";

    // Build email payload - minimalist professional design matching email-templates.ts
    // Updated with responsive layout for mobile/desktop
    const emailPayload: any = {
      From: "GrundbuchauszugOnline <info@grundbuchauszugonline.at>",
      To: order.email,
      Subject: `Bestätigung Ihrer Grundbuchanfrage – ${order.order_number}`,
      HtmlBody: `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>GrundbuchauszugOnline.at</title>
  <style>
    /* Mobile responsive styles */
    @media only screen and (max-width: 480px) {
      .wrapper {
        padding: 16px 12px !important;
      }
      .header {
        padding: 20px 16px !important;
      }
      .ref-banner {
        padding: 12px 16px !important;
      }
      .content {
        padding: 24px 16px !important;
      }
      .footer {
        padding: 20px 16px !important;
      }
      /* Stack table cells on mobile */
      .responsive-table td {
        display: block !important;
        width: 100% !important;
        padding: 0 !important;
        border: none !important;
      }
      .responsive-table .label-cell {
        padding-top: 12px !important;
        padding-bottom: 4px !important;
        font-size: 12px !important;
        color: #71717a !important;
      }
      .responsive-table .value-cell {
        padding-bottom: 12px !important;
        border-bottom: 1px solid #f4f4f5 !important;
      }
      .responsive-table tr:last-child .value-cell {
        border-bottom: none !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; color: #18181b; line-height: 1.65; -webkit-font-smoothing: antialiased;">
  <div class="wrapper" style="max-width: 580px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 4px; border: 1px solid #e4e4e7;">
      
      <!-- Header with Logo -->
      <div class="header" style="background-color: #1a5f4a; padding: 24px 40px; text-align: center;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="display: inline-table; margin: 0 auto;">
          <tr>
            <td style="vertical-align: middle; padding-right: 8px;">
              <img src="https://sclblrqylmzqvbjuegkq.supabase.co/storage/v1/object/public/email-assets/logo.svg" alt="Logo" width="24" height="24" style="display: block; border: 0;" />
            </td>
            <td style="vertical-align: middle;">
              <span style="font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">
                GrundbuchauszugOnline
              </span>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Reference Banner -->
      <div class="ref-banner" style="background-color: #fafafa; padding: 16px 40px; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5;">
        Vorgang <strong style="color: #18181b; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 12px; letter-spacing: 0.3px;">${order.order_number}</strong>
      </div>
      
      <!-- Main Content -->
      <div class="content" style="padding: 40px;">
        <p style="margin: 0 0 24px 0; font-size: 15px; font-weight: 500; color: #18181b;">
          Sehr geehrte(r) ${order.vorname} ${order.nachname},
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #52525b; line-height: 1.7;">
          Wir bestätigen den Eingang Ihrer Bestellung für einen Grundbuchauszug.${hasDocument ? ' Ihr Dokument wurde erfolgreich abgerufen und liegt dieser E-Mail als Anlage bei.' : ''}
        </p>

        ${!hasDocument ? `
        <div style="background-color: #fffbeb; border-left: 2px solid #b45309; padding: 16px 20px; margin: 24px 0;">
           <p style="margin: 0; color: #b45309; font-size: 14px; line-height: 1.6;">
             <strong>Hinweis:</strong> Der automatische Abruf war nicht möglich. Wir senden Ihnen das Dokument innerhalb von 24 Stunden zu oder kontaktieren Sie zur Überprüfung Ihrer Angaben.
           </p>
         </div>
            <strong>Hinweis:</strong> Der automatische Abruf war nicht möglich. Wir senden Ihnen das Dokument innerhalb von 24 Stunden zu oder kontaktieren Sie zur Überprüfung Ihrer Angaben.
          </p>
        </div>
        ` : ''}
        
        <!-- Order Details Table - Responsive -->
        <table class="responsive-table" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0; border-collapse: collapse;">
          <tr>
            <td class="label-cell" style="padding: 14px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px; vertical-align: top;">Produkt</td>
            <td class="value-cell" style="padding: 14px 0; font-size: 14px; font-weight: 500; color: #18181b; border-bottom: 1px solid #f4f4f5; vertical-align: top;">${order.product_name}</td>
          </tr>
          ${order.adresse ? `
          <tr>
            <td class="label-cell" style="padding: 14px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px; vertical-align: top;">Adresse</td>
            <td class="value-cell" style="padding: 14px 0; font-size: 14px; font-weight: 500; color: #18181b; border-bottom: 1px solid #f4f4f5; vertical-align: top;">${order.adresse}${order.plz && order.ort ? `, ${order.plz} ${order.ort}` : ''}</td>
          </tr>
          ` : ''}
          <tr>
            <td class="label-cell" style="padding: 14px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px; vertical-align: top;">Katastralgemeinde</td>
            <td class="value-cell" style="padding: 14px 0; font-size: 14px; font-weight: 500; color: #18181b; border-bottom: 1px solid #f4f4f5; vertical-align: top;">${order.katastralgemeinde}</td>
          </tr>
          <tr>
            <td class="label-cell" style="padding: 14px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px; vertical-align: top;">Einlagezahl</td>
            <td class="value-cell" style="padding: 14px 0; font-size: 13px; font-weight: 500; color: #18181b; border-bottom: 1px solid #f4f4f5; font-family: 'SF Mono', Monaco, Consolas, monospace; vertical-align: top;">${order.grundstuecksnummer}</td>
          </tr>
          <tr>
            <td class="label-cell" style="padding: 14px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px; vertical-align: top;">Bezirksgericht</td>
            <td class="value-cell" style="padding: 14px 0; font-size: 14px; font-weight: 500; color: #18181b; border-bottom: 1px solid #f4f4f5; vertical-align: top;">${order.grundbuchsgericht}</td>
          </tr>
          <tr>
            <td class="label-cell" style="padding: 14px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px; vertical-align: top;">Bundesland</td>
            <td class="value-cell" style="padding: 14px 0; font-size: 14px; font-weight: 500; color: #18181b; border-bottom: 1px solid #f4f4f5; vertical-align: top;">${order.bundesland}</td>
          </tr>
          <tr>
            <td class="label-cell" style="padding: 20px 0 0 0; font-size: 13px; font-weight: 500; color: #18181b; border-top: 1px solid #e4e4e7; width: 140px; vertical-align: top;">Betrag</td>
            <td class="value-cell" style="padding: 20px 0 0 0; font-size: 16px; font-weight: 600; color: #1a5f4a; border-top: 1px solid #e4e4e7; vertical-align: top;">€ ${order.product_price.toFixed(2).replace('.', ',')}</td>
          </tr>
        </table>
        
        <!-- Payment Details Box - Responsive -->
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #52525b; line-height: 1.6;">
          Um die Bestellung vollständig abzuschließen, schließen Sie bitte die Zahlung ab.
        </p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 32px 0;">
          <tr>
            <td style="background-color: #fafafa; padding: 20px 24px; border: 1px solid #e4e4e7; border-radius: 4px;">
              <p style="margin: 0 0 20px 0; font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.8px;">
                Zahlungsinformationen
              </p>
              <table class="responsive-table" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse: collapse;">
                <tr>
                  <td class="label-cell" style="padding: 12px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px; vertical-align: top;">Betrag</td>
                  <td class="value-cell" style="padding: 12px 0; font-size: 15px; font-weight: 600; color: #1a5f4a; border-bottom: 1px solid #f4f4f5; vertical-align: top;">€ ${order.product_price.toFixed(2).replace('.', ',')}</td>
                </tr>
                <tr>
                  <td class="label-cell" style="padding: 12px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px; vertical-align: top;">Empfänger</td>
                  <td class="value-cell" style="padding: 12px 0; font-size: 14px; color: #18181b; border-bottom: 1px solid #f4f4f5; vertical-align: top;">Application Assistant Ltd</td>
                </tr>
                <tr>
                  <td class="label-cell" style="padding: 12px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px; vertical-align: top;">IBAN</td>
                  <td class="value-cell" style="padding: 12px 0; font-size: 13px; color: #18181b; font-family: 'SF Mono', Monaco, Consolas, monospace; border-bottom: 1px solid #f4f4f5; vertical-align: top; word-break: break-all;">DE56 2022 0800 0058 7945 48</td>
                </tr>
                <tr>
                  <td class="label-cell" style="padding: 12px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px; vertical-align: top;">BIC</td>
                  <td class="value-cell" style="padding: 12px 0; font-size: 13px; color: #18181b; font-family: 'SF Mono', Monaco, Consolas, monospace; border-bottom: 1px solid #f4f4f5; vertical-align: top;">SXPYDEHHXXX</td>
                </tr>
                <tr>
                  <td class="label-cell" style="padding: 12px 0; font-size: 13px; color: #71717a; width: 140px; vertical-align: top;">Verwendungszweck</td>
                  <td class="value-cell" style="padding: 12px 0; font-size: 14px; color: #18181b; font-weight: 500; vertical-align: top;">${order.order_number}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <div style="background-color: #fafafa; border-left: 2px solid #1a5f4a; padding: 16px 20px; margin: 24px 0;">
          <p style="margin: 0; color: #52525b; font-size: 14px; line-height: 1.6;">
            Eine detaillierte Rechnung wird Ihnen separat von unserem Buchhaltungssystem zugestellt.
          </p>
        </div>
        
        <!-- Signature -->
        <div style="margin-top: 36px; padding-top: 28px; border-top: 1px solid #f4f4f5;">
          <p style="margin: 0; font-size: 14px; color: #52525b; line-height: 1.8;">Mit freundlichen Grüßen</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 500; color: #18181b;">Ihr Grundbuchservice-Team</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer" style="background-color: #fafafa; padding: 28px 40px; text-align: center; border-top: 1px solid #f4f4f5;">
        <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.8;">
          <a href="mailto:info@grundbuchauszugonline.at" style="color: #71717a; text-decoration: none;">info@grundbuchauszugonline.at</a>
        </p>
        <p style="margin: 12px 0 0 0; font-size: 12px; color: #71717a; line-height: 1.8;">
          <a href="https://grundbuchauszugonline.at/agb" style="color: #71717a; text-decoration: none;">AGB</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="https://grundbuchauszugonline.at/datenschutz" style="color: #71717a; text-decoration: none;">Datenschutz</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="https://grundbuchauszugonline.at/impressum" style="color: #71717a; text-decoration: none;">Impressum</a>
        </p>
        <p style="margin: 16px 0 0 0; font-size: 11px; color: #a1a1aa;">
          © ${new Date().getFullYear()} GrundbuchauszugOnline.at · Unabhängiger Online-Dienstleister
        </p>
      </div>
      
    </div>
  </div>
</body>
</html>
      `,
      TextBody: `
GRUNDBUCHSERVICE ÖSTERREICH
===========================

Sehr geehrte(r) ${order.vorname} ${order.nachname},

Wir bestätigen den Eingang Ihrer Bestellung für einen offiziellen Grundbuchauszug.

${documentTextMessage}

BESTELLÜBERSICHT
----------------
Auftragsnummer: ${order.order_number}
Dokumenttyp: ${order.product_name}${order.adresse ? `
Adresse: ${order.adresse}${order.plz && order.ort ? `, ${order.plz} ${order.ort}` : ''}` : ''}
Katastralgemeinde: ${order.katastralgemeinde}
Einlagezahl / Grundstücksnr.: ${order.grundstuecksnummer}
Rechnungsbetrag: € ${order.product_price.toFixed(2)}

ZAHLUNGSANWEISUNG
-----------------
Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen:

Empfänger: Application Assistant Ltd
IBAN: DE56 2022 0800 0058 7945 48
BIC: SXPYDEHHXXX
Verwendungszweck: ${order.order_number}

Hinweis: Eine detaillierte Rechnung wird Ihnen separat von unserem Buchhaltungssystem zugestellt.

Bei Rückfragen: info@grundbuchauszugonline.at

Mit freundlichen Grüßen,
Ihr Grundbuchservice-Team
GrundbuchauszugOnline.at

---
© ${new Date().getFullYear()} GrundbuchauszugOnline.at
      `,
    };

    // Only add attachment if we have the document
    if (hasDocument) {
      emailPayload.Attachments = [
        {
          Name: `Grundbuchauszug_${order.katastralgemeinde}_${order.grundstuecksnummer}.pdf`,
          Content: pdfBase64,
          ContentType: "application/pdf",
        },
      ];
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
      console.error("Postmark API error:", errorData);
      throw new Error(`Failed to send email: ${emailResponse.status}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult.MessageID);

    // === INTERNAL NOTIFICATION EMAIL ===
    // Send order notification to internal email
    try {
      const internalEmailResponse = await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-Postmark-Server-Token": postmarkApiKey,
        },
        body: JSON.stringify({
          From: "GrundbuchauszugOnline <info@grundbuchauszugonline.at>",
          To: "info@grundbuchauszugonline.at",
          Subject: `${order.fast_delivery ? '[F] ' : ''}[NEUE BESTELLUNG] ${order.order_number} - ${order.vorname} ${order.nachname}`,
          HtmlBody: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto;">
                <div style="background-color: #22c55e; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">🎉 Neue Bestellung eingegangen!</h1>
                </div>
                
                <div style="padding: 30px; background-color: #f8f9fa;">
                  <h2 style="color: #1a365d; margin-top: 0;">Bestellung ${order.order_number}</h2>
                  <p style="color: #666; font-size: 14px; margin-top: -10px;">Besteld op: ${new Date(order.created_at).toLocaleString('de-AT', { dateStyle: 'full', timeStyle: 'short' })}</p>
                  
                  <!-- Klantgegevens -->
                  <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #1a365d; margin-top: 0; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">👤 Klantgegevens</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #666; width: 40%;">Voornaam:</td>
                        <td style="padding: 8px 0; font-weight: bold;">${order.vorname}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666;">Achternaam:</td>
                        <td style="padding: 8px 0; font-weight: bold;">${order.nachname}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666;">E-Mail:</td>
                        <td style="padding: 8px 0;"><a href="mailto:${order.email}" style="color: #3b82f6;">${order.email}</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666;">Wohnsitzland:</td>
                        <td style="padding: 8px 0;">${order.wohnsitzland}</td>
                      </tr>
                      ${order.firma ? `<tr>
                        <td style="padding: 8px 0; color: #666;">Firma:</td>
                        <td style="padding: 8px 0;">${order.firma}</td>
                      </tr>` : ''}
                    </table>
                  </div>
                  
                  <!-- Grundstück Details -->
                  <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #1a365d; margin-top: 0; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">🏠 Grundstück</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      ${order.adresse ? `<tr>
                        <td style="padding: 8px 0; color: #666; width: 40%;">Adresse:</td>
                        <td style="padding: 8px 0; font-weight: bold;">${order.adresse}</td>
                      </tr>` : ''}
                      ${order.plz || order.ort ? `<tr>
                        <td style="padding: 8px 0; color: #666;">PLZ / Ort:</td>
                        <td style="padding: 8px 0; font-weight: bold;">${[order.plz, order.ort].filter(Boolean).join(' ')}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding: 8px 0; color: #666;">Bundesland:</td>
                        <td style="padding: 8px 0; font-weight: bold;">${order.bundesland}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666;">Katastralgemeinde:</td>
                        <td style="padding: 8px 0; font-weight: bold;">${order.katastralgemeinde}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666;">Grundstücksnummer / EZ:</td>
                        <td style="padding: 8px 0; font-weight: bold;">${order.grundstuecksnummer}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666;">Grundbuchsgericht:</td>
                        <td style="padding: 8px 0;">${order.grundbuchsgericht}</td>
                      </tr>
                      ${order.wohnungs_hinweis ? `<tr>
                        <td style="padding: 8px 0; color: #666;">Wohnungshinweis:</td>
                        <td style="padding: 8px 0; font-style: italic;">${order.wohnungs_hinweis}</td>
                      </tr>` : ''}
                    </table>
                  </div>
                  
                  <!-- Product & Prijs -->
                  <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #1a365d; margin-top: 0; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">📋 Bestelling</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #666; width: 40%;">Product:</td>
                        <td style="padding: 8px 0;">${order.product_name}</td>
                      </tr>
                      <tr style="border-top: 1px solid #e2e8f0;">
                        <td style="padding: 12px 0; color: #666; font-weight: bold;">Totaalbedrag:</td>
                        <td style="padding: 12px 0; font-weight: bold; font-size: 20px; color: #22c55e;">€ ${order.product_price.toFixed(2)}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Document Status -->
                  ${hasDocument 
                    ? `<div style="background-color: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #065f46;"><strong>✅ Dokument:</strong> Erfolgreich zugestellt aan klant</p>
                      </div>`
                    : `<div style="background-color: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #991b1b;"><strong>⚠️ ACTIE VEREIST:</strong> Dokument konnte nicht abgerufen werden!</p>
                        <p style="margin: 5px 0 0 0; color: #991b1b; font-size: 14px;">Fehler: ${documentFetchError}</p>
                        <p style="margin: 5px 0 0 0; color: #991b1b; font-size: 14px;"><strong>Bitte manuell zusenden!</strong></p>
                      </div>`}
                  
                  <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e;"><strong>⏳ Zahlung:</strong> Ausstehend (auf Rechnung)</p>
                  </div>
                </div>
                
                <div style="background-color: #e2e8f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                  <p style="margin: 0;">Automatische Benachrichtigung von GrundbuchauszugOnline.at</p>
                </div>
              </body>
            </html>
          `,
          TextBody: `
NEUE BESTELLUNG EINGEGANGEN!
============================

Bestellung: ${order.order_number}
Besteld op: ${new Date(order.created_at).toLocaleString('de-AT')}

=== KLANTGEGEVENS ===
Voornaam: ${order.vorname}
Achternaam: ${order.nachname}
E-Mail: ${order.email}
Wohnsitzland: ${order.wohnsitzland}
${order.firma ? `Firma: ${order.firma}` : ''}

=== GRUNDSTÜCK ===
${order.adresse ? `Adresse: ${order.adresse}` : ''}
${order.plz || order.ort ? `PLZ / Ort: ${[order.plz, order.ort].filter(Boolean).join(' ')}` : ''}
Bundesland: ${order.bundesland}
Katastralgemeinde: ${order.katastralgemeinde}
Grundstücksnummer / EZ: ${order.grundstuecksnummer}
Grundbuchsgericht: ${order.grundbuchsgericht}
${order.wohnungs_hinweis ? `Wohnungshinweis: ${order.wohnungs_hinweis}` : ''}

=== BESTELLING ===
Product: ${order.product_name}
Betrag: € ${order.product_price.toFixed(2)}

=== STATUS ===
Dokument: ${hasDocument ? 'Erfolgreich zugestellt' : `NIET OPGEHAALD - ${documentFetchError}`}
Zahlung: Ausstehend
          `,
        }),
      });

      if (!internalEmailResponse.ok) {
        const errorData = await internalEmailResponse.json();
        console.error("Internal notification email error:", errorData);
      } else {
        console.log("Internal notification email sent successfully");
      }
    } catch (notifyError: any) {
      console.error("Failed to send internal notification (non-blocking):", notifyError.message);
    }

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
