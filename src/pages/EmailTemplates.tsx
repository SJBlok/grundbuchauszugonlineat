import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, AlertTriangle, XCircle, CheckCircle, Bell, FileText } from "lucide-react";

// Mock session data for abandoned cart reminders
const mockSession = {
  session_id: "ABC12345-DEMO-1234-5678-ABCDEFGHIJKL",
  email: "kunde@beispiel.at",
  vorname: "Max",
  nachname: "Mustermann",
  firma: null,
  katastralgemeinde: "Wien, Innere Stadt",
  grundstuecksnummer: "1234/5",
  grundbuchsgericht: "Bezirksgericht Innere Stadt Wien",
  bundesland: "Wien",
  adresse: "Stephansplatz 1",
  plz: "1010",
  ort: "Wien",
  product_name: "Aktueller Grundbuchauszug",
  product_price: 24.90,
};

// Mock order data for order confirmation
const mockOrder = {
  order_number: "GB-2025-001234",
  email: "kunde@beispiel.at",
  vorname: "Max",
  nachname: "Mustermann",
  firma: "Mustermann GmbH",
  katastralgemeinde: "Wien, Innere Stadt",
  grundstuecksnummer: "1234/5",
  grundbuchsgericht: "Bezirksgericht Innere Stadt Wien",
  bundesland: "Wien",
  adresse: "Stephansplatz 1",
  plz: "1010",
  ort: "Wien",
  wohnsitzland: "Österreich",
  product_name: "Aktueller Grundbuchauszug",
  product_price: 19.90,
  wohnungs_hinweis: "Top 4, 2. Stock",
  created_at: new Date().toISOString(),
};

const resumeUrl = "https://grundbuchauszugonline.at/anfordern?resume=ABC12345";

function getAbandonedReminderTemplate(reminderNumber: 1 | 2 | 3) {
  const propertyInfo = {
    katastralgemeinde: mockSession.katastralgemeinde || "—",
    grundstuecksnummer: mockSession.grundstuecksnummer || "—",
    grundbuchsgericht: mockSession.grundbuchsgericht || "—",
    bundesland: mockSession.bundesland || "—",
    adresse: mockSession.adresse && mockSession.ort 
      ? `${mockSession.adresse}, ${mockSession.plz || ""} ${mockSession.ort}`.trim()
      : "—",
  };
  
  const productName = mockSession.product_name || "Aktueller Grundbuchauszug";
  const productPrice = mockSession.product_price ? `€ ${Number(mockSession.product_price).toFixed(2).replace('.', ',')}` : "€ 24,90";
  const orderReference = mockSession.session_id.slice(0, 8).toUpperCase();
  const customerName = mockSession.vorname 
    ? `${mockSession.vorname} ${mockSession.nachname || ""}`.trim() 
    : "";
  const salutation = customerName ? `Sehr geehrte/r ${customerName}` : "Sehr geehrte Damen und Herren";

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
      timing: "1 uur na sessie",
      icon: Clock,
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
    };
  }

  if (reminderNumber === 2) {
    return {
      subject: `Erinnerung: Ihre Anfrage ${orderReference} läuft in 48 Stunden ab`,
      timing: "25 uur na sessie",
      icon: AlertTriangle,
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
    };
  }

  // Reminder 3
  return {
    subject: `Letzte Erinnerung: Anfrage ${orderReference} läuft heute ab`,
    timing: "72 uur na sessie",
    icon: XCircle,
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
  };
}

function getOrderConfirmationTemplate(hasDocument: boolean) {
  const order = mockOrder;
  const currentYear = new Date().getFullYear();
  
  const documentMessage = hasDocument 
    ? "<p><strong>Anbei erhalten Sie Ihren angeforderten Grundbuchauszug als PDF-Dokument.</strong></p>"
    : `<div style="background-color: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0; color: #991b1b;"><strong>⚠️ Wichtiger Hinweis:</strong> Das Dokument konnte nicht automatisch abgerufen werden. Wir werden Ihnen den Grundbuchauszug schnellstmöglich manuell zusenden.</p>
      </div>`;

  return {
    subject: `Bestätigung Ihrer Grundbuchanfrage – ${order.order_number}`,
    timing: "Direct na bestelling",
    icon: CheckCircle,
    htmlBody: `
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; color: #1f2937;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
      <tr>
        <td style="padding: 40px 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header with Austrian flag stripe -->
            <tr>
              <td style="background: linear-gradient(to right, #ed1c24 0%, #ed1c24 33%, #ffffff 33%, #ffffff 66%, #ed1c24 66%, #ed1c24 100%); height: 6px;"></td>
            </tr>
            <tr>
              <td style="background-color: #064e3b; padding: 32px 40px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">GRUNDBUCHSERVICE ÖSTERREICH</h1>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #a7f3d0; letter-spacing: 1px; text-transform: uppercase;">Offizieller Auszugs-Service</p>
              </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
              <td style="padding: 40px;">
                <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">
                  <strong>Sehr geehrte(r) ${order.vorname} ${order.nachname},</strong>
                </p>
                
                <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
                  Wir bestätigen den Eingang Ihrer Bestellung für einen offiziellen Grundbuchauszug. ${hasDocument ? 'Ihr Dokument wurde erfolgreich abgerufen und liegt dieser E-Mail als Anlage bei.' : ''}
                </p>

                ${!hasDocument ? `
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 24px 0;">
                  <tr>
                    <td style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px 20px; border-radius: 0 6px 6px 0;">
                      <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: 600;">⚠ Hinweis zur Dokumentzustellung</p>
                      <p style="margin: 8px 0 0 0; font-size: 14px; color: #7f1d1d; line-height: 1.5;">
                        Der automatische Abruf war nicht möglich. Unser Fachteam wird Ihren Grundbuchauszug manuell beschaffen und Ihnen umgehend zusenden.
                      </p>
                    </td>
                  </tr>
                </table>
                ` : ''}
                
                <!-- Order Details Box -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin: 0 0 24px 0;">
                  <tr>
                    <td style="padding: 24px;">
                      <h2 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #064e3b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #064e3b; padding-bottom: 8px;">
                        Bestellübersicht
                      </h2>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Auftragsnummer</td>
                          <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">${order.order_number}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Dokumenttyp</td>
                          <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">${order.product_name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Katastralgemeinde</td>
                          <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">${order.katastralgemeinde}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Einlagezahl / Grundstücksnr.</td>
                          <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">${order.grundstuecksnummer}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-size: 16px; color: #064e3b; font-weight: 700;">Rechnungsbetrag</td>
                          <td style="padding: 8px 0; font-size: 20px; color: #064e3b; font-weight: 700; text-align: right;">€ ${order.product_price.toFixed(2)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- Payment Details Box -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; margin: 0 0 24px 0;">
                  <tr>
                    <td style="padding: 24px;">
                      <h2 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">
                        💳 Zahlungsanweisung
                      </h2>
                      <p style="margin: 0 0 16px 0; font-size: 14px; color: #78350f; line-height: 1.5;">
                        Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen auf folgendes Konto:
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 6px; padding: 16px;">
                        <tr>
                          <td style="padding: 16px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 6px 0; font-size: 13px; color: #78350f;">Empfänger</td>
                                <td style="padding: 6px 0; font-size: 14px; color: #1f2937; font-weight: 600; text-align: right;">Application Assistant Ltd</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-size: 13px; color: #78350f;">IBAN</td>
                                <td style="padding: 6px 0; font-size: 14px; color: #1f2937; font-weight: 600; font-family: 'Courier New', monospace; text-align: right;">DE56 2022 0800 0058 7945 48</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-size: 13px; color: #78350f;">BIC</td>
                                <td style="padding: 6px 0; font-size: 14px; color: #1f2937; font-weight: 600; font-family: 'Courier New', monospace; text-align: right;">SXPYDEHHXXX</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-size: 13px; color: #78350f;">Verwendungszweck</td>
                                <td style="padding: 6px 0; font-size: 14px; color: #1f2937; font-weight: 600; text-align: right;">${order.order_number}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280; line-height: 1.6;">
                  📄 <strong>Hinweis:</strong> Eine detaillierte Rechnung wird Ihnen separat von unserem Buchhaltungssystem zugestellt.
                </p>
                
                <p style="margin: 0 0 24px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                  Bei Rückfragen erreichen Sie unseren Kundenservice unter <a href="mailto:info@grundbuchauszugonline.at" style="color: #064e3b; font-weight: 600; text-decoration: none;">info@grundbuchauszugonline.at</a>
                </p>
                
                <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.7;">
                  Mit freundlichen Grüßen,<br><br>
                  <strong style="color: #064e3b;">Ihr Grundbuchservice-Team</strong><br>
                  <span style="font-size: 13px; color: #6b7280;">GrundbuchauszugOnline.at</span>
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f3f4f6; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="text-align: center;">
                      <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">
                        © ${currentYear} GrundbuchauszugOnline.at – Ihr Partner für Grundbuchauszüge in Österreich
                      </p>
                      <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                        Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese Nachricht.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Austrian flag stripe bottom -->
            <tr>
              <td style="background: linear-gradient(to right, #ed1c24 0%, #ed1c24 33%, #ffffff 33%, #ffffff 66%, #ed1c24 66%, #ed1c24 100%); height: 6px;"></td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}

function getInternalNotificationTemplate(hasDocument: boolean) {
  const order = mockOrder;
  const documentFetchError = "API timeout - connection refused";
  
  return {
    subject: `[NEUE BESTELLUNG] ${order.order_number} - ${order.vorname} ${order.nachname}`,
    timing: "Intern - na elke bestelling",
    icon: Bell,
    htmlBody: `
<!DOCTYPE html>
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
</html>`,
  };
}

type TemplateCategory = "abandoned" | "order";

const EmailTemplates = () => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("abandoned");
  const [activeTemplate, setActiveTemplate] = useState<string>("1");

  const abandonedTemplates = [
    { id: "1", ...getAbandonedReminderTemplate(1) },
    { id: "2", ...getAbandonedReminderTemplate(2) },
    { id: "3", ...getAbandonedReminderTemplate(3) },
  ];

  const orderTemplates = [
    { id: "order-success", ...getOrderConfirmationTemplate(true), label: "Met document" },
    { id: "order-manual", ...getOrderConfirmationTemplate(false), label: "Zonder document (handmatig)" },
    { id: "internal-success", ...getInternalNotificationTemplate(true), label: "Intern - Succes" },
    { id: "internal-error", ...getInternalNotificationTemplate(false), label: "Intern - Actie vereist" },
  ];

  const currentTemplates = activeCategory === "abandoned" ? abandonedTemplates : orderTemplates;
  const currentTemplate = currentTemplates.find(t => t.id === activeTemplate) || currentTemplates[0];

  // Reset active template when category changes
  const handleCategoryChange = (category: TemplateCategory) => {
    setActiveCategory(category);
    setActiveTemplate(category === "abandoned" ? "1" : "order-success");
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Mail className="h-8 w-8 text-primary" />
            Email Templates
          </h1>
          <p className="text-muted-foreground">
            Preview van alle automatische emails
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleCategoryChange("abandoned")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeCategory === "abandoned"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            <Clock className="h-4 w-4 inline-block mr-2" />
            Abandoned Cart Reminders
          </button>
          <button
            onClick={() => handleCategoryChange("order")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeCategory === "order"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            <FileText className="h-4 w-4 inline-block mr-2" />
            Bestelbevestigingen
          </button>
        </div>

        <Tabs value={activeTemplate} onValueChange={setActiveTemplate}>
          <TabsList className="mb-6 w-full justify-start flex-wrap h-auto gap-2">
            {currentTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <TabsTrigger 
                  key={template.id} 
                  value={template.id}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {'label' in template ? (template as { label: string }).label : `Reminder ${template.id}`}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {currentTemplates.map((template) => (
            <TabsContent key={template.id} value={template.id}>
              <Card className="mb-6">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-lg mb-2">
                        {template.subject}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <Badge variant="outline" className="font-normal">
                          <Clock className="h-3 w-3 mr-1" />
                          {template.timing}
                        </Badge>
                        <span>•</span>
                        <span>Van: info@grundbuchauszugonline.at</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border-t">
                    <iframe
                      srcDoc={template.htmlBody}
                      className="w-full h-[800px] border-0"
                      title={`Email template ${template.id}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Overview Cards */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">
              {activeCategory === "abandoned" ? "Abandoned Cart Flow" : "Bestelflow"} Overzicht
            </h3>
            <div className={`grid gap-4 ${activeCategory === "abandoned" ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"}`}>
              {currentTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => setActiveTemplate(template.id)}
                    className={`flex items-start gap-3 p-4 rounded-lg bg-background border transition-all text-left ${
                      activeTemplate === template.id ? "ring-2 ring-primary" : "hover:border-primary/50"
                    }`}
                  >
                    <div className="p-2 rounded-full bg-primary/10 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {'label' in template ? (template as { label: string }).label : `Reminder ${template.id}`}
                      </p>
                      <p className="text-sm text-muted-foreground">{template.timing}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailTemplates;
