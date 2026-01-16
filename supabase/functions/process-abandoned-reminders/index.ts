import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AbandonedSession {
  id: string;
  session_id: string;
  email: string;
  vorname: string | null;
  nachname: string | null;
  firma: string | null;
  katastralgemeinde: string | null;
  grundstuecksnummer: string | null;
  grundbuchsgericht: string | null;
  bundesland: string | null;
  adresse: string | null;
  plz: string | null;
  ort: string | null;
  product_name: string;
  product_price: number;
  created_at: string;
  expires_at: string;
  reminder_1_sent: boolean;
  reminder_2_sent: boolean;
  reminder_3_sent: boolean;
  order_completed: boolean;
}

// Email templates
function getEmailTemplate(
  reminderNumber: 1 | 2 | 3,
  session: AbandonedSession,
  resumeUrl: string
): { subject: string; htmlBody: string; textBody: string } {
  const propertyAddress = session.adresse && session.ort
    ? `${session.adresse}, ${session.plz || ""} ${session.ort}`
    : `KG ${session.katastralgemeinde || "N/A"}, EZ/GST ${session.grundstuecksnummer || "N/A"}`;
  
  const productName = session.product_name || "Aktueller Grundbuchauszug";
  const orderReference = session.session_id;
  const customerName = session.vorname ? `${session.vorname} ${session.nachname || ""}`.trim() : "Sehr geehrte Damen und Herren";

  const baseStyles = `
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #064e3b; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; }
    .header p { margin: 8px 0 0 0; font-size: 12px; color: #a7f3d0; letter-spacing: 1px; text-transform: uppercase; }
    .content { padding: 40px; }
    .product-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0; }
    .cta-button { display: inline-block; background-color: #064e3b; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; }
    .footer { background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 0; font-size: 12px; color: #6b7280; }
    .warning-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px 20px; margin: 24px 0; }
  `;

  if (reminderNumber === 1) {
    return {
      subject: "Ihre Anfrage wurde noch nicht abgeschlossen",
      htmlBody: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>GRUNDBUCHSERVICE ÖSTERREICH</h1>
      <p>Offizieller Auszugs-Service</p>
    </div>
    <div class="content">
      <p>Sehr geehrte(r) ${customerName},</p>
      <p>Sie haben vor Kurzem eine Anfrage für einen Grundbuchauszug begonnen. Wir haben festgestellt, dass die Bestellung noch nicht abgeschlossen wurde.</p>
      
      <div class="product-box">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #064e3b;">Ausgewähltes Produkt</p>
        <p style="margin: 0 0 4px 0;"><strong>${productName}</strong></p>
        <p style="margin: 0; color: #6b7280;">Liegenschaft: ${propertyAddress}</p>
        <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 13px;">Referenz: ${orderReference}</p>
      </div>
      
      <p>Ihre Sitzungsdaten wurden vorübergehend gespeichert. Sie können die Bestellung jederzeit fortsetzen.</p>
      
      <div style="text-align: center;">
        <a href="${resumeUrl}" class="cta-button">Bestellung fortsetzen</a>
      </div>
      
      <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">Bei Fragen stehen wir Ihnen jederzeit zur Verfügung.</p>
    </div>
    <div class="footer">
      <p><strong>GrundbuchauszugOnline.at</strong></p>
      <p style="margin-top: 8px;">Wir sind ein unabhängiger Online-Dienstleister und keine staatliche Stelle.</p>
    </div>
  </div>
</body>
</html>`,
      textBody: `Sehr geehrte(r) ${customerName},

Sie haben vor Kurzem eine Anfrage für einen Grundbuchauszug begonnen. Wir haben festgestellt, dass die Bestellung noch nicht abgeschlossen wurde.

Ausgewähltes Produkt: ${productName}
Liegenschaft: ${propertyAddress}
Referenz: ${orderReference}

Ihre Sitzungsdaten wurden vorübergehend gespeichert. Sie können die Bestellung jederzeit fortsetzen:
${resumeUrl}

Bei Fragen stehen wir Ihnen jederzeit zur Verfügung.

GrundbuchauszugOnline.at
Wir sind ein unabhängiger Online-Dienstleister und keine staatliche Stelle.`,
    };
  }

  if (reminderNumber === 2) {
    return {
      subject: "Handlungsbedarf: Ihre Anfrage wird nur vorübergehend gespeichert",
      htmlBody: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>GRUNDBUCHSERVICE ÖSTERREICH</h1>
      <p>Offizieller Auszugs-Service</p>
    </div>
    <div class="content">
      <p>Sehr geehrte(r) ${customerName},</p>
      
      <div class="warning-box">
        <p style="margin: 0; font-weight: 600; color: #991b1b;">Wichtiger Hinweis zur Datenspeicherung</p>
        <p style="margin: 8px 0 0 0; color: #7f1d1d;">Ihre Bestellsitzung wird nur <strong>72 Stunden</strong> gespeichert. Nach Ablauf dieser Frist werden alle eingegebenen Daten automatisch und unwiderruflich gelöscht.</p>
      </div>
      
      <p>Sie haben eine Anfrage für einen Grundbuchauszug begonnen, die noch nicht abgeschlossen wurde.</p>
      
      <div class="product-box">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #064e3b;">Ihre Bestelldetails</p>
        <p style="margin: 0 0 4px 0;"><strong>${productName}</strong></p>
        <p style="margin: 0; color: #6b7280;">Liegenschaft: ${propertyAddress}</p>
        <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 13px;">Referenz: ${orderReference}</p>
      </div>
      
      <p>Um Ihre Daten nicht zu verlieren, schließen Sie bitte Ihre Bestellung zeitnah ab.</p>
      
      <div style="text-align: center;">
        <a href="${resumeUrl}" class="cta-button">Zur Anfrage zurückkehren</a>
      </div>
    </div>
    <div class="footer">
      <p><strong>GrundbuchauszugOnline.at</strong></p>
      <p style="margin-top: 8px;">Wir sind ein unabhängiger Online-Dienstleister und keine staatliche Stelle.</p>
    </div>
  </div>
</body>
</html>`,
      textBody: `Sehr geehrte(r) ${customerName},

WICHTIGER HINWEIS ZUR DATENSPEICHERUNG:
Ihre Bestellsitzung wird nur 72 Stunden gespeichert. Nach Ablauf dieser Frist werden alle eingegebenen Daten automatisch und unwiderruflich gelöscht.

Sie haben eine Anfrage für einen Grundbuchauszug begonnen, die noch nicht abgeschlossen wurde.

Ihre Bestelldetails:
Produkt: ${productName}
Liegenschaft: ${propertyAddress}
Referenz: ${orderReference}

Um Ihre Daten nicht zu verlieren, schließen Sie bitte Ihre Bestellung zeitnah ab:
${resumeUrl}

GrundbuchauszugOnline.at
Wir sind ein unabhängiger Online-Dienstleister und keine staatliche Stelle.`,
    };
  }

  // Reminder 3 - Final
  return {
    subject: "Letzte Erinnerung – Ihre Anfrage läuft heute ab",
    htmlBody: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>GRUNDBUCHSERVICE ÖSTERREICH</h1>
      <p>Offizieller Auszugs-Service</p>
    </div>
    <div class="content">
      <p>Sehr geehrte(r) ${customerName},</p>
      
      <div class="warning-box" style="background-color: #fee2e2; border-left-color: #b91c1c;">
        <p style="margin: 0; font-weight: 700; color: #7f1d1d; font-size: 16px;">⚠ LETZTE ERINNERUNG</p>
        <p style="margin: 8px 0 0 0; color: #7f1d1d;">Dies ist die letzte Erinnerung. <strong>Ihre Sitzung wird nach Ablauf von 72 Stunden automatisch und unwiderruflich gelöscht.</strong></p>
        <p style="margin: 8px 0 0 0; color: #991b1b;">Alle eingegebenen Daten gehen verloren und können nicht wiederhergestellt werden.</p>
      </div>
      
      <div class="product-box">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #064e3b;">Ihre nicht abgeschlossene Bestellung</p>
        <p style="margin: 0 0 4px 0;"><strong>${productName}</strong></p>
        <p style="margin: 0; color: #6b7280;">Liegenschaft: ${propertyAddress}</p>
        <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 13px;">Referenz: ${orderReference}</p>
      </div>
      
      <p style="font-weight: 600;">Handeln Sie jetzt, um Ihre Daten zu sichern und die Bestellung abzuschließen.</p>
      
      <div style="text-align: center;">
        <a href="${resumeUrl}" class="cta-button" style="background-color: #b91c1c;">Jetzt abschließen</a>
      </div>
    </div>
    <div class="footer">
      <p><strong>GrundbuchauszugOnline.at</strong></p>
      <p style="margin-top: 8px;">Wir sind ein unabhängiger Online-Dienstleister und keine staatliche Stelle.</p>
    </div>
  </div>
</body>
</html>`,
    textBody: `Sehr geehrte(r) ${customerName},

⚠ LETZTE ERINNERUNG

Dies ist die letzte Erinnerung. Ihre Sitzung wird nach Ablauf von 72 Stunden automatisch und unwiderruflich gelöscht.
Alle eingegebenen Daten gehen verloren und können nicht wiederhergestellt werden.

Ihre nicht abgeschlossene Bestellung:
Produkt: ${productName}
Liegenschaft: ${propertyAddress}
Referenz: ${orderReference}

Handeln Sie jetzt, um Ihre Daten zu sichern und die Bestellung abzuschließen:
${resumeUrl}

GrundbuchauszugOnline.at
Wir sind ein unabhängiger Online-Dienstleister und keine staatliche Stelle.`,
  };
}

async function sendReminderEmail(
  postmarkApiKey: string,
  session: AbandonedSession,
  reminderNumber: 1 | 2 | 3
): Promise<void> {
  const resumeUrl = `https://grundbuchauszugonline.at/anfordern?resume=${session.session_id}`;
  const template = getEmailTemplate(reminderNumber, session, resumeUrl);

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": postmarkApiKey,
    },
    body: JSON.stringify({
      From: "Grundbuchservice Österreich <info@grundbuchauszugonline.at>",
      To: session.email,
      Subject: template.subject,
      HtmlBody: template.htmlBody,
      TextBody: template.textBody,
      MessageStream: "outbound",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Postmark error: ${response.status} - ${errorText}`);
  }

  console.log(`Sent reminder ${reminderNumber} to ${session.email}`);
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const postmarkApiKey = Deno.env.get("POSTMARK_API_KEY");
    if (!postmarkApiKey) {
      throw new Error("POSTMARK_API_KEY not configured");
    }

    const now = new Date();
    let remindersSent = 0;
    let sessionsDeleted = 0;

    // 1. Delete expired sessions (older than 72 hours)
    const { data: expiredSessions, error: expiredError } = await supabase
      .from("abandoned_sessions")
      .select("id, session_id")
      .lt("expires_at", now.toISOString())
      .eq("order_completed", false);

    if (expiredError) {
      console.error("Error fetching expired sessions:", expiredError);
    } else if (expiredSessions && expiredSessions.length > 0) {
      const { error: deleteError } = await supabase
        .from("abandoned_sessions")
        .delete()
        .in("id", expiredSessions.map(s => s.id));

      if (deleteError) {
        console.error("Error deleting expired sessions:", deleteError);
      } else {
        sessionsDeleted = expiredSessions.length;
        console.log(`Deleted ${sessionsDeleted} expired sessions`);
      }
    }

    // 2. Get all active abandoned sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("abandoned_sessions")
      .select("*")
      .eq("order_completed", false)
      .gte("expires_at", now.toISOString());

    if (sessionsError) {
      throw new Error(`Error fetching sessions: ${sessionsError.message}`);
    }

    if (!sessions || sessions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No abandoned sessions to process",
          remindersSent: 0,
          sessionsDeleted
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Process each session
    for (const session of sessions as AbandonedSession[]) {
      const createdAt = new Date(session.created_at);
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      try {
        // Reminder 3: 72 hours after session creation (if not already sent)
        if (hoursSinceCreation >= 72 && !session.reminder_3_sent) {
          await sendReminderEmail(postmarkApiKey, session, 3);
          await supabase
            .from("abandoned_sessions")
            .update({ reminder_3_sent: true })
            .eq("id", session.id);
          remindersSent++;
        }
        // Reminder 2: 25 hours after session creation (1h + 24h)
        else if (hoursSinceCreation >= 25 && !session.reminder_2_sent) {
          await sendReminderEmail(postmarkApiKey, session, 2);
          await supabase
            .from("abandoned_sessions")
            .update({ reminder_2_sent: true })
            .eq("id", session.id);
          remindersSent++;
        }
        // Reminder 1: 1 hour after session creation
        else if (hoursSinceCreation >= 1 && !session.reminder_1_sent) {
          await sendReminderEmail(postmarkApiKey, session, 1);
          await supabase
            .from("abandoned_sessions")
            .update({ reminder_1_sent: true })
            .eq("id", session.id);
          remindersSent++;
        }
      } catch (emailError: any) {
        console.error(`Error sending reminder for session ${session.id}:`, emailError.message);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${sessions.length} sessions`,
        remindersSent,
        sessionsDeleted
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error processing abandoned reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
