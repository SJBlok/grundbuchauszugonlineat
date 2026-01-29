import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, AlertTriangle, XCircle } from "lucide-react";

// Mock session data for preview
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

const resumeUrl = "https://grundbuchauszugonline.at/anfordern?resume=ABC12345";

function getEmailTemplate(reminderNumber: 1 | 2 | 3) {
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

const EmailTemplates = () => {
  const [activeTemplate, setActiveTemplate] = useState<"1" | "2" | "3">("1");

  const templates = [
    { id: "1" as const, ...getEmailTemplate(1) },
    { id: "2" as const, ...getEmailTemplate(2) },
    { id: "3" as const, ...getEmailTemplate(3) },
  ];

  const currentTemplate = templates.find(t => t.id === activeTemplate)!;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Mail className="h-8 w-8 text-primary" />
            Email Templates
          </h1>
          <p className="text-muted-foreground">
            Preview van alle automatische reminder emails voor verlaten sessies
          </p>
        </div>

        <Tabs value={activeTemplate} onValueChange={(v) => setActiveTemplate(v as "1" | "2" | "3")}>
          <TabsList className="mb-6 w-full justify-start">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <TabsTrigger 
                  key={template.id} 
                  value={template.id}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  Reminder {template.id}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {templates.map((template) => (
            <TabsContent key={template.id} value={template.id}>
              <Card className="mb-6">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-lg mb-2">
                        {template.subject}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                      className="w-full h-[700px] border-0"
                      title={`Email template ${template.id}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Template Overzicht</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {templates.map((template) => {
                const Icon = template.icon;
                return (
                  <div 
                    key={template.id}
                    className="flex items-start gap-3 p-4 rounded-lg bg-background border"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Reminder {template.id}</p>
                      <p className="text-sm text-muted-foreground">{template.timing}</p>
                    </div>
                  </div>
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
