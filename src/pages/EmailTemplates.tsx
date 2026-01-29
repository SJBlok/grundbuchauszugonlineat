import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, AlertTriangle, XCircle, CheckCircle, Bell, FileText } from "lucide-react";
import {
  getBaseStyles,
  getEmailHeader,
  getRefBanner,
  getOrderDetailsTable,
  getCtaButton,
  getNoticeBox,
  getSignature,
  getEmailFooter,
  getPaymentDetailsBox,
  wrapEmailContent,
  BRAND_COLORS,
} from "@/lib/email-templates";

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
      : undefined,
  };
  
  const productName = mockSession.product_name || "Aktueller Grundbuchauszug";
  const productPrice = mockSession.product_price 
    ? `€ ${Number(mockSession.product_price).toFixed(2).replace('.', ',')}` 
    : "€ 24,90";
  const orderReference = mockSession.session_id.slice(0, 8).toUpperCase();
  const customerName = mockSession.vorname 
    ? `${mockSession.vorname} ${mockSession.nachname || ""}`.trim() 
    : "";
  const salutation = customerName ? `Sehr geehrte/r ${customerName}` : "Sehr geehrte Damen und Herren";

  const orderTable = getOrderDetailsTable({
    product: productName,
    katastralgemeinde: propertyInfo.katastralgemeinde,
    grundstuecksnummer: propertyInfo.grundstuecksnummer,
    grundbuchsgericht: propertyInfo.grundbuchsgericht,
    bundesland: propertyInfo.bundesland,
    adresse: propertyInfo.adresse,
    price: productPrice,
  });

  if (reminderNumber === 1) {
    const content = `
      ${getEmailHeader("Dokumentenservice")}
      ${getRefBanner(orderReference)}
      <div class="content">
        <p class="greeting">${salutation},</p>
        <p>Sie haben kürzlich eine Anfrage für einen Grundbuchauszug gestartet. Wir haben festgestellt, dass Ihre Bestellung noch nicht abgeschlossen wurde.</p>
        <p>Ihre eingegebenen Daten wurden vorübergehend gespeichert. Sie können die Bestellung jederzeit fortsetzen:</p>
        ${orderTable}
        ${getCtaButton(resumeUrl, "Bestellung fortsetzen")}
        <p style="font-size: 14px; color: ${BRAND_COLORS.textMuted};">Bei Fragen stehen wir Ihnen gerne unter <a href="mailto:info@grundbuchauszugonline.at" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">info@grundbuchauszugonline.at</a> zur Verfügung.</p>
        ${getSignature()}
      </div>
      ${getEmailFooter()}
    `;
    return {
      subject: `Ihre Anfrage ${orderReference} – Noch nicht abgeschlossen`,
      timing: "1 Stunde nach Sitzung",
      icon: Clock,
      htmlBody: wrapEmailContent(content, { preheader: "Ihre Grundbuchauszug-Bestellung wartet auf Sie" }),
    };
  }

  if (reminderNumber === 2) {
    const content = `
      ${getEmailHeader("Dokumentenservice")}
      ${getRefBanner(orderReference, "Erinnerung")}
      <div class="content">
        <p class="greeting">${salutation},</p>
        ${getNoticeBox("<strong>Wichtiger Hinweis zur Datenspeicherung</strong><br>Ihre Sitzungsdaten werden aus Datenschutzgründen nur <strong>72 Stunden</strong> gespeichert. Danach werden alle eingegebenen Daten automatisch und unwiderruflich gelöscht.", "warning")}
        <p>Sie haben eine Anfrage für einen Grundbuchauszug begonnen, die noch nicht abgeschlossen wurde.</p>
        ${orderTable}
        ${getCtaButton(resumeUrl, "Jetzt Bestellung abschließen")}
        <p style="font-size: 14px; color: ${BRAND_COLORS.textMuted};">Um Datenverlust zu vermeiden, empfehlen wir Ihnen, die Bestellung zeitnah abzuschließen.</p>
        ${getSignature()}
      </div>
      ${getEmailFooter()}
    `;
    return {
      subject: `Erinnerung: Ihre Anfrage ${orderReference} läuft in 48 Stunden ab`,
      timing: "25 Stunden nach Sitzung",
      icon: AlertTriangle,
      htmlBody: wrapEmailContent(content, { preheader: "Ihre Daten werden in 48 Stunden gelöscht" }),
    };
  }

  // Reminder 3
  const content = `
    ${getEmailHeader("Dokumentenservice")}
    ${getRefBanner(orderReference, "Letzte Erinnerung")}
    <div class="content">
      <p class="greeting">${salutation},</p>
      ${getNoticeBox("<strong>⚠️ Hinweis zur Datenlöschung</strong><br>Dies ist die letzte Erinnerung. Nach Ablauf der 72-Stunden-Frist werden alle eingegebenen Daten gemäß unserer Datenschutzrichtlinien <strong>automatisch gelöscht</strong>. Eine Wiederherstellung ist danach nicht mehr möglich.", "error")}
      <p>Sie haben eine Anfrage für einen Grundbuchauszug begonnen, die noch nicht abgeschlossen wurde.</p>
      ${orderTable}
      ${getCtaButton(resumeUrl, "Bestellung jetzt abschließen")}
      <p style="font-size: 14px; color: ${BRAND_COLORS.textMuted};">Um Ihre eingegebenen Daten zu sichern, empfehlen wir Ihnen, die Bestellung heute abzuschließen.</p>
      ${getSignature()}
    </div>
    ${getEmailFooter()}
  `;
  return {
    subject: `Letzte Erinnerung: Anfrage ${orderReference} läuft heute ab`,
    timing: "72 Stunden nach Sitzung",
    icon: XCircle,
    htmlBody: wrapEmailContent(content, { preheader: "Ihre Daten werden heute gelöscht – letzte Chance zur Bestellung" }),
  };
}

function getOrderConfirmationTemplate(hasDocument: boolean) {
  const order = mockOrder;
  const orderTable = getOrderDetailsTable({
    product: order.product_name,
    katastralgemeinde: order.katastralgemeinde,
    grundstuecksnummer: order.grundstuecksnummer,
    grundbuchsgericht: order.grundbuchsgericht,
    bundesland: order.bundesland,
    adresse: order.adresse ? `${order.adresse}, ${order.plz} ${order.ort}` : undefined,
    price: `€ ${order.product_price.toFixed(2).replace('.', ',')}`,
  });

  const documentNotice = hasDocument 
    ? `<p style="color: ${BRAND_COLORS.success}; font-weight: 600;">✅ Ihr angeforderter Grundbuchauszug liegt dieser E-Mail als PDF-Dokument bei.</p>`
    : getNoticeBox("<strong>⚠️ Hinweis zur Dokumentzustellung</strong><br>Der automatische Abruf war nicht möglich. Unser Fachteam wird Ihren Grundbuchauszug manuell beschaffen und Ihnen umgehend zusenden.", "error");

  const content = `
    ${getEmailHeader("Offizieller Auszugs-Service")}
    ${getRefBanner(order.order_number, "Bestellbestätigung")}
    <div class="content">
      <p class="greeting">Sehr geehrte(r) ${order.vorname} ${order.nachname},</p>
      <p>Wir bestätigen den Eingang Ihrer Bestellung für einen offiziellen Grundbuchauszug.</p>
      ${documentNotice}
      ${orderTable}
      ${getPaymentDetailsBox(order.order_number)}
      <p style="font-size: 13px; color: ${BRAND_COLORS.textMuted};">
        📄 <strong>Hinweis:</strong> Eine detaillierte Rechnung wird Ihnen separat von unserem Buchhaltungssystem zugestellt.
      </p>
      <p>Bei Rückfragen erreichen Sie unseren Kundenservice unter <a href="mailto:info@grundbuchauszugonline.at" style="color: ${BRAND_COLORS.primary}; font-weight: 600; text-decoration: none;">info@grundbuchauszugonline.at</a></p>
      ${getSignature()}
    </div>
    ${getEmailFooter()}
  `;

  return {
    subject: `Bestätigung Ihrer Grundbuchanfrage – ${order.order_number}`,
    timing: "Direkt nach Bestellung",
    icon: CheckCircle,
    htmlBody: wrapEmailContent(content, { 
      preheader: hasDocument 
        ? "Ihr Grundbuchauszug liegt bei" 
        : "Bestellung bestätigt – Dokument folgt in Kürze" 
    }),
  };
}

function getInternalNotificationTemplate(hasDocument: boolean) {
  const order = mockOrder;
  const documentFetchError = "API timeout - connection refused";
  const currentYear = new Date().getFullYear();
  
  // Internal emails use a simpler, functional design
  const content = `
<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; background-color: #f8fafb;">
    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%); color: white; padding: 24px 32px;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 600;">
        ${hasDocument ? '✅' : '⚠️'} Neue Bestellung eingegangen
      </h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Auftragsnummer: ${order.order_number}</p>
    </div>
    
    <div style="padding: 32px; background-color: #ffffff;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">
        Bestellt am: ${new Date(order.created_at).toLocaleString('de-AT', { dateStyle: 'full', timeStyle: 'short' })}
      </p>
      
      <!-- Status Box -->
      ${hasDocument 
        ? `<div style="background-color: ${BRAND_COLORS.successBg}; border: 1px solid ${BRAND_COLORS.successBorder}; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
            <p style="margin: 0; color: ${BRAND_COLORS.success}; font-weight: 600;">✅ Dokument erfolgreich an Kunde zugestellt</p>
          </div>`
        : `<div style="background-color: ${BRAND_COLORS.errorBg}; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
            <p style="margin: 0 0 8px 0; color: ${BRAND_COLORS.error}; font-weight: 600;">⚠️ AKTION ERFORDERLICH: Dokument konnte nicht abgerufen werden!</p>
            <p style="margin: 0; color: ${BRAND_COLORS.error}; font-size: 14px;">Fehler: ${documentFetchError}</p>
            <p style="margin: 8px 0 0 0; color: ${BRAND_COLORS.error}; font-size: 14px; font-weight: 600;">Bitte manuell zusenden!</p>
          </div>`}
      
      <!-- Klantgegevens -->
      <div style="background-color: #f9fafb; border: 1px solid ${BRAND_COLORS.border}; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
        <h3 style="color: ${BRAND_COLORS.primaryDark}; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid ${BRAND_COLORS.primary}; padding-bottom: 8px;">👤 Kundendaten</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 40%; font-size: 14px;">Name:</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${order.vorname} ${order.nachname}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">E-Mail:</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${order.email}" style="color: ${BRAND_COLORS.primary};">${order.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Wohnsitzland:</td>
            <td style="padding: 8px 0; font-size: 14px;">${order.wohnsitzland}</td>
          </tr>
          ${order.firma ? `<tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Firma:</td>
            <td style="padding: 8px 0; font-size: 14px;">${order.firma}</td>
          </tr>` : ''}
        </table>
      </div>
      
      <!-- Grundstück Details -->
      <div style="background-color: #f9fafb; border: 1px solid ${BRAND_COLORS.border}; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
        <h3 style="color: ${BRAND_COLORS.primaryDark}; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid ${BRAND_COLORS.primary}; padding-bottom: 8px;">🏠 Grundstück</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${order.adresse ? `<tr>
            <td style="padding: 8px 0; color: #6b7280; width: 40%; font-size: 14px;">Adresse:</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${order.adresse}</td>
          </tr>` : ''}
          ${order.plz || order.ort ? `<tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">PLZ / Ort:</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${[order.plz, order.ort].filter(Boolean).join(' ')}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Bundesland:</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${order.bundesland}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Katastralgemeinde:</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${order.katastralgemeinde}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Grundstücksnummer / EZ:</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 14px; font-family: 'SF Mono', Monaco, Consolas, monospace;">${order.grundstuecksnummer}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Grundbuchsgericht:</td>
            <td style="padding: 8px 0; font-size: 14px;">${order.grundbuchsgericht}</td>
          </tr>
          ${order.wohnungs_hinweis ? `<tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Wohnungshinweis:</td>
            <td style="padding: 8px 0; font-style: italic; font-size: 14px;">${order.wohnungs_hinweis}</td>
          </tr>` : ''}
        </table>
      </div>
      
      <!-- Product & Prijs -->
      <div style="background-color: #f9fafb; border: 1px solid ${BRAND_COLORS.border}; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
        <h3 style="color: ${BRAND_COLORS.primaryDark}; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid ${BRAND_COLORS.primary}; padding-bottom: 8px;">📋 Bestellung</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 40%; font-size: 14px;">Produkt:</td>
            <td style="padding: 8px 0; font-size: 14px;">${order.product_name}</td>
          </tr>
          <tr style="border-top: 1px solid ${BRAND_COLORS.border};">
            <td style="padding: 16px 0 8px 0; color: #6b7280; font-weight: 600; font-size: 14px;">Gesamtbetrag:</td>
            <td style="padding: 16px 0 8px 0; font-weight: 700; font-size: 20px; color: ${BRAND_COLORS.primary};">€ ${order.product_price.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: ${BRAND_COLORS.warningBg}; border: 1px solid ${BRAND_COLORS.warningBorder}; border-radius: 8px; padding: 16px;">
        <p style="margin: 0; color: ${BRAND_COLORS.warning}; font-weight: 600;">⏳ Zahlung: Ausstehend (auf Rechnung)</p>
      </div>
    </div>
    
    <div style="background-color: #f3f4f6; padding: 20px 32px; text-align: center; border-top: 1px solid ${BRAND_COLORS.border};">
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        Automatische Benachrichtigung von GrundbuchauszugOnline.at<br>
        © ${currentYear}
      </p>
    </div>
  </body>
</html>`;

  return {
    subject: `[${hasDocument ? 'NEUE BESTELLUNG' : '⚠️ AKTION ERFORDERLICH'}] ${order.order_number} - ${order.vorname} ${order.nachname}`,
    timing: "Intern - nach jeder Bestellung",
    icon: Bell,
    htmlBody: content,
  };
}

type TemplateCategory = "abandoned" | "order";

const EmailTemplates = () => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("abandoned");
  const [activeTemplate, setActiveTemplate] = useState<string>("1");

  const abandonedTemplates = [
    { id: "1", ...getAbandonedReminderTemplate(1), label: "1. Erinnerung" },
    { id: "2", ...getAbandonedReminderTemplate(2), label: "2. Erinnerung" },
    { id: "3", ...getAbandonedReminderTemplate(3), label: "Letzte Erinnerung" },
  ];

  const orderTemplates = [
    { id: "order-success", ...getOrderConfirmationTemplate(true), label: "Mit Dokument" },
    { id: "order-manual", ...getOrderConfirmationTemplate(false), label: "Ohne Dokument (manuell)" },
    { id: "internal-success", ...getInternalNotificationTemplate(true), label: "Intern - Erfolg" },
    { id: "internal-error", ...getInternalNotificationTemplate(false), label: "Intern - Aktion erforderlich" },
  ];

  const currentTemplates = activeCategory === "abandoned" ? abandonedTemplates : orderTemplates;
  const currentTemplate = currentTemplates.find(t => t.id === activeTemplate) || currentTemplates[0];

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
            Vorschau aller automatisierten E-Mails mit einheitlichem Branding
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
            Erinnerungen
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
            Bestellbestätigungen
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
                  {template.label}
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
                        <span>Von: info@grundbuchauszugonline.at</span>
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
              {activeCategory === "abandoned" ? "Erinnerungs-Flow" : "Bestell-Flow"} Übersicht
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
                      <p className="font-medium truncate">{template.label}</p>
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
