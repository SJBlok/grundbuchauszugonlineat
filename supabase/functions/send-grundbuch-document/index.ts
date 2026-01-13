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

    // Build email payload
    const emailPayload: any = {
      From: "info@grundbuchauszugonline.at",
      To: order.email,
      Subject: `Ihre Bestellung ${order.order_number} - Grundbuchauszug`,
      HtmlBody: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1a365d; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">GrundbuchauszugOnline.at</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f8f9fa;">
              <h2 style="color: #1a365d; margin-top: 0;">Guten Tag ${order.vorname} ${order.nachname},</h2>
              
              <p>vielen Dank für Ihre Bestellung bei GrundbuchauszugOnline.at!</p>
              
              ${documentMessage}
              
              <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1a365d; margin-top: 0; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">📋 Bestelldetails</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Bestellnummer:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${order.order_number}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Produkt:</td>
                    <td style="padding: 8px 0;">${order.product_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Katastralgemeinde:</td>
                    <td style="padding: 8px 0;">${order.katastralgemeinde}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Grundstücksnummer:</td>
                    <td style="padding: 8px 0;">${order.grundstuecksnummer}</td>
                  </tr>
                  <tr style="border-top: 1px solid #e2e8f0;">
                    <td style="padding: 12px 0; color: #666; font-weight: bold;">Gesamtbetrag:</td>
                    <td style="padding: 12px 0; font-weight: bold; font-size: 18px; color: #1a365d;">€ ${order.product_price.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">💳 Zahlungsinformationen</h3>
                <p style="margin-bottom: 15px; color: #856404;">Bitte überweisen Sie den Betrag innerhalb von 14 Tagen:</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #856404;">Empfänger:</td>
                    <td style="padding: 6px 0; font-weight: bold;">Application Assistant Ltd</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #856404;">IBAN:</td>
                    <td style="padding: 6px 0; font-weight: bold; font-family: monospace;">DE56 2022 0800 0058 7945 48</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #856404;">BIC:</td>
                    <td style="padding: 6px 0; font-weight: bold; font-family: monospace;">SXPYDEHHXXX</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #856404;">Verwendungszweck:</td>
                    <td style="padding: 6px 0; font-weight: bold;">${order.order_number}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #856404;">Betrag:</td>
                    <td style="padding: 6px 0; font-weight: bold;">€ ${order.product_price.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                📄 <strong>Hinweis:</strong> Die offizielle Rechnung erhalten Sie separat per E-Mail von unserem Buchhaltungssystem.
              </p>
              
              <p>Bei Fragen stehen wir Ihnen gerne unter <a href="mailto:info@grundbuchauszugonline.at" style="color: #1a365d;">info@grundbuchauszugonline.at</a> zur Verfügung.</p>
              
              <p style="margin-top: 30px;">
                Mit freundlichen Grüßen,<br>
                <strong>Ihr Team von GrundbuchauszugOnline.at</strong>
              </p>
            </div>
            
            <div style="background-color: #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #666;">
              <p style="margin: 0;">© ${new Date().getFullYear()} GrundbuchauszugOnline.at | Alle Rechte vorbehalten</p>
              <p style="margin: 10px 0 0 0;">Diese E-Mail wurde automatisch generiert.</p>
            </div>
          </body>
        </html>
      `,
      TextBody: `
Guten Tag ${order.vorname} ${order.nachname},

vielen Dank für Ihre Bestellung bei GrundbuchauszugOnline.at!

${documentTextMessage}

=== BESTELLDETAILS ===
Bestellnummer: ${order.order_number}
Produkt: ${order.product_name}
Katastralgemeinde: ${order.katastralgemeinde}
Grundstücksnummer: ${order.grundstuecksnummer}
Gesamtbetrag: € ${order.product_price.toFixed(2)}

=== ZAHLUNGSINFORMATIONEN ===
Bitte überweisen Sie den Betrag innerhalb von 14 Tagen:

Empfänger: Application Assistant Ltd
IBAN: DE56 2022 0800 0058 7945 48
BIC: SXPYDEHHXXX
Verwendungszweck: ${order.order_number}
Betrag: € ${order.product_price.toFixed(2)}

Hinweis: Die offizielle Rechnung erhalten Sie separat per E-Mail von unserem Buchhaltungssystem.

Bei Fragen stehen wir Ihnen gerne unter info@grundbuchauszugonline.at zur Verfügung.

Mit freundlichen Grüßen,
Ihr Team von GrundbuchauszugOnline.at
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
          From: "info@grundbuchauszugonline.at",
          To: "info@grundbuchauszugonline.at",
          Subject: `[NEUE BESTELLUNG] ${order.order_number} - ${order.vorname} ${order.nachname}`,
          HtmlBody: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #22c55e; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">🎉 Neue Bestellung eingegangen!</h1>
                </div>
                
                <div style="padding: 30px; background-color: #f8f9fa;">
                  <h2 style="color: #1a365d; margin-top: 0;">Bestellung ${order.order_number}</h2>
                  
                  <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #1a365d; margin-top: 0; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">👤 Kundendaten</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #666; width: 40%;">Name:</td>
                        <td style="padding: 8px 0; font-weight: bold;">${order.vorname} ${order.nachname}</td>
                      </tr>
                      ${order.firma ? `<tr>
                        <td style="padding: 8px 0; color: #666;">Firma:</td>
                        <td style="padding: 8px 0;">${order.firma}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding: 8px 0; color: #666;">E-Mail:</td>
                        <td style="padding: 8px 0;"><a href="mailto:${order.email}">${order.email}</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666;">Wohnsitzland:</td>
                        <td style="padding: 8px 0;">${order.wohnsitzland}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #1a365d; margin-top: 0; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">📋 Bestelldetails</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #666; width: 40%;">Produkt:</td>
                        <td style="padding: 8px 0;">${order.product_name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666;">Katastralgemeinde:</td>
                        <td style="padding: 8px 0; font-weight: bold;">${order.katastralgemeinde}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666;">Grundstücksnummer:</td>
                        <td style="padding: 8px 0; font-weight: bold;">${order.grundstuecksnummer}</td>
                      </tr>
                      <tr style="border-top: 1px solid #e2e8f0;">
                        <td style="padding: 12px 0; color: #666; font-weight: bold;">Betrag:</td>
                        <td style="padding: 12px 0; font-weight: bold; font-size: 18px; color: #22c55e;">€ ${order.product_price.toFixed(2)}</td>
                      </tr>
                    </table>
                  </div>
                  
                  ${hasDocument 
                    ? `<div style="background-color: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #065f46;"><strong>✅ Dokument:</strong> Erfolgreich zugestellt</p>
                      </div>`
                    : `<div style="background-color: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #991b1b;"><strong>⚠️ ACHTUNG:</strong> Dokument konnte nicht abgerufen werden!</p>
                        <p style="margin: 5px 0 0 0; color: #991b1b; font-size: 14px;">Fehler: ${documentFetchError}</p>
                        <p style="margin: 5px 0 0 0; color: #991b1b; font-size: 14px;"><strong>Bitte manuell zusenden!</strong></p>
                      </div>`}
                  
                  <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e;"><strong>⏳ Zahlung:</strong> Ausstehend</p>
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

Bestellung: ${order.order_number}

=== KUNDENDATEN ===
Name: ${order.vorname} ${order.nachname}
${order.firma ? `Firma: ${order.firma}` : ''}
E-Mail: ${order.email}
Wohnsitzland: ${order.wohnsitzland}

=== BESTELLDETAILS ===
Produkt: ${order.product_name}
Katastralgemeinde: ${order.katastralgemeinde}
Grundstücksnummer: ${order.grundstuecksnummer}
Betrag: € ${order.product_price.toFixed(2)}

Status: Warte auf Zahlung
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
