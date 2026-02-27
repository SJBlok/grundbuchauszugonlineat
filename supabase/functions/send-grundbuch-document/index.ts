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
  fast_delivery: boolean;
  digital_storage_subscription: boolean;
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

  // Build line items for invoice
  const basePrice = order.digital_storage_subscription 
    ? (order.product_price - 7.95) 
    : order.product_price;

  const detailsAttributes: Array<{description: string; price: string; amount: string; tax_rate_id: string}> = [
    {
      description: `${order.product_name}\nKG: ${order.katastralgemeinde}\nEZ/GST: ${order.grundstuecksnummer}`,
      price: basePrice.toString(),
      amount: "1",
      tax_rate_id: MONEYBIRD_TAX_RATE_ID,
    },
  ];

  if (order.digital_storage_subscription) {
    detailsAttributes.push({
      description: "Digitale Speicherung – monatliches Abonnement",
      price: "7.95",
      amount: "1",
      tax_rate_id: MONEYBIRD_TAX_RATE_ID,
    });
  }

  const invoiceData = {
    sales_invoice: {
      contact_id: contactId,
      workflow_id: MONEYBIRD_WORKFLOW_ID,
      document_style_id: MONEYBIRD_DOC_STYLE_ID,
      reference: order.order_number,
      prices_are_incl_tax: true,
      details_attributes: detailsAttributes,
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
    const body = await req.json();

    // Support both camelCase (internal use) and snake_case (portal API)
    const orderId = body.orderId || body.order_id;
    const sessionId = body.sessionId || body.session_id;
    const providedPdfBase64 = body.pdf_base64 || null;
    const documentType = body.document_type || "aktuell";

    // Determine auth method: portal API key, valid origin, or internal service-to-service call
    const apiKey = req.headers.get("x-api-key");
    const validApiKey = Deno.env.get("PORTAL_API_KEY");
    const hasValidApiKey = apiKey && validApiKey && apiKey === validApiKey;

    // Allow internal service-to-service calls (e.g. from process-order)
    const authHeader = req.headers.get("authorization") || "";
    const supabaseServiceKeyVal = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const isInternalCall = supabaseServiceKeyVal && authHeader === `Bearer ${supabaseServiceKeyVal}`;

    if (!hasValidApiKey && !isValidOrigin(req) && !isInternalCall) {
      console.warn("Rejected request: no valid API key or origin");
      return new Response(
        JSON.stringify({ error: "Unauthorized: provide x-api-key header or request from allowed origin" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!orderId) {
      throw new Error("Order ID is required (order_id)");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify order exists
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
    
    // Only block re-processing for internal calls (no API key), not for portal API calls
    // Allow re-processing if PDF is provided (admin sending document)
    if (orderCheck.status === "processed" && !hasValidApiKey && !isInternalCall && !providedPdfBase64) {
      return new Response(
        JSON.stringify({ error: "Order already processed", order_id: orderCheck.id }),
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
    let pdfBase64: string | null = providedPdfBase64;
    let documentFetchError: string | null = null;

    if (!pdfBase64) {
      console.warn("No PDF provided in request body, email will be sent without attachment");
      documentFetchError = "Kein PDF bereitgestellt";
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
          ${hasDocument 
            ? 'Wir bestätigen den Eingang Ihrer Bestellung für einen Grundbuchauszug. Ihr Dokument wurde erfolgreich abgerufen und liegt dieser E-Mail als Anlage bei.'
            : 'Vielen Dank für Ihre Bestellung. <strong>Ihre Bestellung wird manuell bearbeitet.</strong> Die Dokumente werden innerhalb von 24 Stunden per E-Mail bereitgestellt.'}
        </p>
        
        <!-- Order Summary - Compact -->
        <table class="responsive-table" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 28px 0; border-collapse: collapse;">
          <tr>
            <td class="label-cell" style="padding: 10px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px; vertical-align: top;">Produkt</td>
            <td class="value-cell" style="padding: 10px 0; font-size: 14px; font-weight: 500; color: #18181b; border-bottom: 1px solid #f4f4f5; vertical-align: top;">${order.product_name}</td>
          </tr>
          ${order.adresse ? `
          <tr>
            <td class="label-cell" style="padding: 10px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px; vertical-align: top;">Objekt</td>
            <td class="value-cell" style="padding: 10px 0; font-size: 14px; color: #18181b; border-bottom: 1px solid #f4f4f5; vertical-align: top;">${order.adresse}${order.plz && order.ort ? `, ${order.plz} ${order.ort}` : ''}</td>
          </tr>
          ` : ''}
          ${order.digital_storage_subscription ? `
          <tr>
            <td class="label-cell" style="padding: 10px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px; vertical-align: top;">Digitale Speicherung</td>
            <td class="value-cell" style="padding: 10px 0; font-size: 14px; color: #18181b; border-bottom: 1px solid #f4f4f5; vertical-align: top;">€ 7,95 / Monat</td>
          </tr>
          ` : ''}
          <tr>
            <td class="label-cell" style="padding: 14px 0 0 0; font-size: 13px; font-weight: 500; color: #18181b; border-top: 1px solid #e4e4e7; width: 140px; vertical-align: top;">Gesamt</td>
            <td class="value-cell" style="padding: 14px 0 0 0; font-size: 16px; font-weight: 600; color: #1a5f4a; border-top: 1px solid #e4e4e7; vertical-align: top;">€ ${order.product_price.toFixed(2).replace('.', ',')}</td>
          </tr>
        </table>
        
        <!-- Payment Block -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 28px 0;">
          <tr>
            <td style="background-color: #fafafa; padding: 20px 24px; border: 1px solid #e4e4e7; border-radius: 4px;">
              <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.8px;">Überweisung</p>
              <table class="responsive-table" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse: collapse;">
                <tr>
                  <td class="label-cell" style="padding: 8px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px;">Empfänger</td>
                  <td class="value-cell" style="padding: 8px 0; font-size: 14px; color: #18181b; border-bottom: 1px solid #f4f4f5;">Application Assistant Ltd</td>
                </tr>
                <tr>
                  <td class="label-cell" style="padding: 8px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5; width: 140px;">IBAN</td>
                  <td class="value-cell" style="padding: 8px 0; font-size: 13px; color: #18181b; font-family: 'SF Mono', Monaco, Consolas, monospace; border-bottom: 1px solid #f4f4f5; word-break: break-all;">DE56 2022 0800 0058 7945 48</td>
                </tr>
                <tr>
                  <td class="label-cell" style="padding: 8px 0; font-size: 13px; color: #71717a; width: 140px;">Verwendungszweck</td>
                  <td class="value-cell" style="padding: 8px 0; font-size: 14px; color: #18181b; font-weight: 500;">${order.order_number}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        ${order.digital_storage_subscription ? `
        <!-- Digital Storage Notice -->
        <div style="background-color: #fafafa; border-left: 2px solid #1a5f4a; padding: 16px 20px; margin: 0 0 28px 0;">
          <p style="margin: 0; color: #18181b; font-size: 14px; font-weight: 500;">Digitale Speicherung aktiviert</p>
          <p style="margin: 8px 0 0 0; color: #52525b; font-size: 14px; line-height: 1.6;">
            Ihr Grundbuchauszug wird innerhalb von 24 Stunden in unserem sicheren Portal bereitgestellt: 
            <a href="https://grundbuchauszugonline.at/meine-dokumente" style="color: #1a5f4a; font-weight: 500;">grundbuchauszugonline.at/meine-dokumente</a>
          </p>
          <p style="margin: 8px 0 0 0; color: #71717a; font-size: 13px;">Sie erhalten dazu eine separate E-Mail mit Ihren Zugangsdaten.</p>
        </div>
        ` : ''}

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
Rechnungsbetrag: € ${order.product_price.toFixed(2)}${order.digital_storage_subscription ? `
Digitale Speicherung: € 7,95 / Monat (im Betrag enthalten)` : ''}

ZAHLUNGSANWEISUNG
-----------------
Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen:

Empfänger: Application Assistant Ltd
IBAN: DE56 2022 0800 0058 7945 48
BIC: SXPYDEHHXXX
Verwendungszweck: ${order.order_number}

${order.digital_storage_subscription ? `
DIGITALE SPEICHERUNG
--------------------
Ihr Grundbuchauszug wird innerhalb von 24 Stunden in unserem sicheren Portal bereitgestellt:
https://grundbuchauszugonline.at/meine-dokumente
Sie erhalten dazu eine separate E-Mail mit Ihren Zugangsdaten.
` : ''}Bei Rückfragen: info@grundbuchauszugonline.at

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
          Name: `Grundbuchauszug_${order.katastralgemeinde}_${order.grundstuecksnummer}_${documentType}.pdf`,
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

    // Update order status
    await supabase
      .from("orders")
      .update({ status: "processed" })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({ 
        success: true,
        message_id: emailResult.MessageID,
        order_number: order.order_number,
        document_sent: hasDocument,
        email_sent_to: order.email,
        status_updated_to: "processed",
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
