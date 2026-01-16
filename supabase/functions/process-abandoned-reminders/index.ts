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
  const propertyInfo = {
    katastralgemeinde: session.katastralgemeinde || "—",
    grundstuecksnummer: session.grundstuecksnummer || "—",
    grundbuchsgericht: session.grundbuchsgericht || "—",
    bundesland: session.bundesland || "—",
    adresse: session.adresse && session.ort 
      ? `${session.adresse}, ${session.plz || ""} ${session.ort}`.trim()
      : "—",
  };
  
  const productName = session.product_name || "Aktueller Grundbuchauszug";
  const productPrice = session.product_price ? `€ ${Number(session.product_price).toFixed(2).replace('.', ',')}` : "€ 24,90";
  const orderReference = session.session_id.slice(0, 8).toUpperCase();
  const customerName = session.vorname 
    ? `${session.vorname} ${session.nachname || ""}`.trim() 
    : "";
  const salutation = customerName ? `Sehr geehrte/r ${customerName}` : "Sehr geehrte Damen und Herren";

  const logoUrl = "https://grundbuchauszugonline.at/favicon.svg";

  const baseStyles = `
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; color: #333333; line-height: 1.5; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
    .container { background-color: #ffffff; border-radius: 4px; overflow: hidden; }
    .header { background-color: #166534; padding: 24px 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 600; color: #ffffff; letter-spacing: 0.3px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.8); }
    .ref-banner { background-color: #f9fafb; padding: 12px 32px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; }
    .content { padding: 32px; }
    .content p { margin: 0 0 16px 0; font-size: 15px; color: #374151; }
    .order-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .order-table td { padding: 10px 0; font-size: 14px; border-bottom: 1px solid #f3f4f6; color: #374151; }
    .order-table tr:last-child td { border-bottom: none; }
    .order-table .label { color: #6b7280; width: 45%; }
    .order-table .value { font-weight: 500; color: #111827; }
    .total-row td { padding-top: 16px; border-top: 1px solid #e5e7eb; border-bottom: none; }
    .total-row .value { font-weight: 600; color: #166534; font-size: 15px; }
    .cta-section { text-align: center; padding: 8px 0 24px 0; }
    .cta-button { display: inline-block; background-color: #166534; color: #ffffff !important; text-decoration: none; padding: 14px 32px; font-weight: 600; font-size: 15px; border-radius: 4px; }
    .notice-box { background-color: #f9fafb; border-left: 3px solid #166534; padding: 14px 16px; margin: 20px 0; font-size: 14px; }
    .notice-box p { margin: 0; color: #374151; }
    .footer { background-color: #f9fafb; padding: 20px 32px; text-align: center; }
    .footer p { margin: 0 0 4px 0; font-size: 12px; color: #6b7280; }
    .footer-disclaimer { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
  `;

  const orderDetailsTable = `
    <table class="order-table">
      <tr>
        <td class="label">Produkt</td>
        <td class="value">${productName}</td>
      </tr>
      <tr>
        <td class="label">Katastralgemeinde</td>
        <td class="value">${propertyInfo.katastralgemeinde}</td>
      </tr>
      <tr>
        <td class="label">Einlagezahl / GST-Nr.</td>
        <td class="value">${propertyInfo.grundstuecksnummer}</td>
      </tr>
      <tr>
        <td class="label">Bezirksgericht</td>
        <td class="value">${propertyInfo.grundbuchsgericht}</td>
      </tr>
      <tr>
        <td class="label">Bundesland</td>
        <td class="value">${propertyInfo.bundesland}</td>
      </tr>
      ${propertyInfo.adresse !== "—" ? `
      <tr>
        <td class="label">Adresse</td>
        <td class="value">${propertyInfo.adresse}</td>
      </tr>
      ` : ''}
      <tr class="total-row">
        <td class="label">Gesamtbetrag</td>
        <td class="value">${productPrice}</td>
      </tr>
    </table>
  `;

  const footerHtml = `
    <div class="footer">
      <p>GrundbuchauszugOnline.at</p>
      <p>info@grundbuchauszugonline.at</p>
      <div class="footer-disclaimer">
        Wir sind ein unabhängiger Online-Dienstleister und keine staatliche Stelle.
      </div>
    </div>
  `;

  if (reminderNumber === 1) {
    return {
      subject: `Ihre Anfrage ${orderReference} – Noch nicht abgeschlossen`,
      htmlBody: `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>GrundbuchauszugOnline.at</h1>
        <p>Ihr Grundbuchservice für Österreich</p>
      </div>
      <div class="ref-banner">
        Vorgangs-Nr.: <strong>${orderReference}</strong>
      </div>
      <div class="content">
        <p>${salutation},</p>
        <p>Sie haben kürzlich eine Anfrage für einen Grundbuchauszug gestartet. Wir haben festgestellt, dass Ihre Bestellung noch nicht abgeschlossen wurde.</p>
        <p>Ihre eingegebenen Daten wurden vorübergehend gespeichert. Sie können die Bestellung jederzeit fortsetzen:</p>
        
        ${orderDetailsTable}
        
        <div class="cta-section">
          <a href="${resumeUrl}" class="cta-button">Bestellung fortsetzen →</a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">Bei Fragen stehen wir Ihnen gerne unter info@grundbuchauszugonline.at zur Verfügung.</p>
      </div>
      ${footerHtml}
    </div>
  </div>
</body>
</html>`,
      textBody: `GRUNDBUCHSERVICE ÖSTERREICH
Vorgangs-Nr.: ${orderReference}

${salutation},

Sie haben kürzlich eine Anfrage für einen Grundbuchauszug gestartet. Wir haben festgestellt, dass Ihre Bestellung noch nicht abgeschlossen wurde.

BESTELLÜBERSICHT
────────────────────────────
Produkt: ${productName}
Katastralgemeinde: ${propertyInfo.katastralgemeinde}
Einlagezahl / GST-Nr.: ${propertyInfo.grundstuecksnummer}
Bezirksgericht: ${propertyInfo.grundbuchsgericht}
Bundesland: ${propertyInfo.bundesland}
${propertyInfo.adresse !== "—" ? `Adresse: ${propertyInfo.adresse}` : ''}
────────────────────────────
Gesamtbetrag (inkl. USt.): ${productPrice}

Bestellung fortsetzen: ${resumeUrl}

Bei Fragen: info@grundbuchauszugonline.at

GrundbuchauszugOnline.at
Wir sind ein unabhängiger Online-Dienstleister und keine staatliche Stelle.`,
    };
  }

  if (reminderNumber === 2) {
    return {
      subject: `Erinnerung: Ihre Anfrage ${orderReference} läuft in 48 Stunden ab`,
      htmlBody: `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>GrundbuchauszugOnline.at</h1>
        <p>Ihr Grundbuchservice für Österreich</p>
      </div>
      <div class="ref-banner">
        Vorgangs-Nr.: <strong>${orderReference}</strong>
      </div>
      <div class="content">
        <p>${salutation},</p>
        
        <div class="notice-box">
          <p><strong>Wichtiger Hinweis zur Datenspeicherung</strong>
          Ihre Sitzungsdaten werden aus Datenschutzgründen nur <strong>72 Stunden</strong> gespeichert. Danach werden alle eingegebenen Daten automatisch und unwiderruflich gelöscht.</p>
        </div>
        
        <p>Sie haben eine Anfrage für einen Grundbuchauszug begonnen, die noch nicht abgeschlossen wurde.</p>
        
        ${orderDetailsTable}
        
        <div class="cta-section">
          <a href="${resumeUrl}" class="cta-button">Jetzt Bestellung abschließen →</a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">Um Datenverlust zu vermeiden, empfehlen wir Ihnen, die Bestellung zeitnah abzuschließen.</p>
      </div>
      ${footerHtml}
    </div>
  </div>
</body>
</html>`,
      textBody: `GRUNDBUCHSERVICE ÖSTERREICH
Vorgangs-Nr.: ${orderReference}

${salutation},

WICHTIGER HINWEIS ZUR DATENSPEICHERUNG:
Ihre Sitzungsdaten werden aus Datenschutzgründen nur 72 Stunden gespeichert. 
Danach werden alle eingegebenen Daten automatisch und unwiderruflich gelöscht.

Sie haben eine Anfrage für einen Grundbuchauszug begonnen, die noch nicht abgeschlossen wurde.

BESTELLÜBERSICHT
────────────────────────────
Produkt: ${productName}
Katastralgemeinde: ${propertyInfo.katastralgemeinde}
Einlagezahl / GST-Nr.: ${propertyInfo.grundstuecksnummer}
Bezirksgericht: ${propertyInfo.grundbuchsgericht}
Bundesland: ${propertyInfo.bundesland}
${propertyInfo.adresse !== "—" ? `Adresse: ${propertyInfo.adresse}` : ''}
────────────────────────────
Gesamtbetrag (inkl. USt.): ${productPrice}

Jetzt Bestellung abschließen: ${resumeUrl}

GrundbuchauszugOnline.at
Wir sind ein unabhängiger Online-Dienstleister und keine staatliche Stelle.`,
    };
  }

  // Reminder 3 - Final (same professional styling)
  return {
    subject: `Letzte Erinnerung: Anfrage ${orderReference} läuft heute ab`,
    htmlBody: `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>GrundbuchauszugOnline.at</h1>
        <p>Ihr Grundbuchservice für Österreich</p>
      </div>
      <div class="ref-banner">
        Vorgangs-Nr.: <strong>${orderReference}</strong> — <span style="font-weight: 600;">Letzte Erinnerung</span>
      </div>
      <div class="content">
        <p>${salutation},</p>
        
        <div class="notice-box final">
          <p><strong>Hinweis zur Datenlöschung</strong>
          Dies ist die letzte Erinnerung. Nach Ablauf der 72-Stunden-Frist werden alle eingegebenen Daten gemäß unserer Datenschutzrichtlinien <strong>automatisch gelöscht</strong>. Eine Wiederherstellung ist danach nicht mehr möglich.</p>
        </div>
        
        <p>Sie haben eine Anfrage für einen Grundbuchauszug begonnen, die noch nicht abgeschlossen wurde.</p>
        
        ${orderDetailsTable}
        
        <div class="cta-section">
          <a href="${resumeUrl}" class="cta-button">Bestellung jetzt abschließen →</a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">Um Ihre eingegebenen Daten zu sichern, empfehlen wir Ihnen, die Bestellung heute abzuschließen.</p>
      </div>
      ${footerHtml}
    </div>
  </div>
</body>
</html>`,
    textBody: `GRUNDBUCHSERVICE ÖSTERREICH
Vorgangs-Nr.: ${orderReference} — Letzte Erinnerung

${salutation},

HINWEIS ZUR DATENLÖSCHUNG:
Dies ist die letzte Erinnerung. Nach Ablauf der 72-Stunden-Frist werden alle 
eingegebenen Daten gemäß unserer Datenschutzrichtlinien automatisch gelöscht. 
Eine Wiederherstellung ist danach nicht mehr möglich.

Sie haben eine Anfrage für einen Grundbuchauszug begonnen, die noch nicht abgeschlossen wurde.

BESTELLÜBERSICHT
────────────────────────────
Produkt: ${productName}
Katastralgemeinde: ${propertyInfo.katastralgemeinde}
Einlagezahl / GST-Nr.: ${propertyInfo.grundstuecksnummer}
Bezirksgericht: ${propertyInfo.grundbuchsgericht}
Bundesland: ${propertyInfo.bundesland}
${propertyInfo.adresse !== "—" ? `Adresse: ${propertyInfo.adresse}` : ''}
────────────────────────────
Gesamtbetrag (inkl. USt.): ${productPrice}

Bestellung jetzt abschließen: ${resumeUrl}

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
      From: "GrundbuchauszugOnline.at <info@grundbuchauszugonline.at>",
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
