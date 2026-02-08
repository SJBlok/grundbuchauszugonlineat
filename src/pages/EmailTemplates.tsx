import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, AlertTriangle, XCircle, CheckCircle, Bell, FileText, BarChart3 } from "lucide-react";
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
import { getDailyReportTemplate } from "@/lib/daily-report-template";

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
  product_price: 23.88,
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
  product_price: 23.88,
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
      ${getEmailHeader()}
      ${getRefBanner(orderReference)}
      <div class="content">
        <p class="greeting">${salutation},</p>
        <p>Sie haben kürzlich eine Anfrage für einen Grundbuchauszug gestartet. Ihre Bestellung wurde noch nicht abgeschlossen.</p>
        <p>Ihre Daten wurden gespeichert. Sie können jederzeit fortfahren:</p>
        ${orderTable}
        ${getCtaButton(resumeUrl, "Bestellung fortsetzen")}
        <p style="font-size: 13px; color: ${BRAND_COLORS.textMuted};">Fragen? Schreiben Sie uns: <a href="mailto:info@grundbuchauszugonline.at" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">info@grundbuchauszugonline.at</a></p>
        ${getSignature()}
      </div>
      ${getEmailFooter()}
    `;
    return {
      subject: `Anfrage ${orderReference} – Noch nicht abgeschlossen`,
      timing: "1 Stunde nach Sitzung",
      icon: Clock,
      htmlBody: wrapEmailContent(content, { preheader: "Ihre Grundbuchauszug-Bestellung wartet auf Sie" }),
    };
  }

  if (reminderNumber === 2) {
    const content = `
      ${getEmailHeader()}
      ${getRefBanner(orderReference, "Erinnerung")}
      <div class="content">
        <p class="greeting">${salutation},</p>
        ${getNoticeBox("<strong>Datenspeicherung:</strong> Ihre Sitzungsdaten werden nach 72 Stunden automatisch gelöscht.", "warning")}
        <p>Sie haben eine Anfrage für einen Grundbuchauszug begonnen, die noch offen ist.</p>
        ${orderTable}
        ${getCtaButton(resumeUrl, "Jetzt abschließen")}
        ${getSignature()}
      </div>
      ${getEmailFooter()}
    `;
    return {
      subject: `Erinnerung: Anfrage ${orderReference} läuft in 48 Stunden ab`,
      timing: "25 Stunden nach Sitzung",
      icon: AlertTriangle,
      htmlBody: wrapEmailContent(content, { preheader: "Ihre Daten werden in 48 Stunden gelöscht" }),
    };
  }

  // Reminder 3
  const content = `
    ${getEmailHeader()}
    ${getRefBanner(orderReference, "Letzte Erinnerung")}
    <div class="content">
      <p class="greeting">${salutation},</p>
      ${getNoticeBox("<strong>Datenlöschung heute:</strong> Nach Ablauf der 72-Stunden-Frist werden Ihre Daten automatisch gelöscht.", "error")}
      <p>Ihre Anfrage für einen Grundbuchauszug ist noch offen.</p>
      ${orderTable}
      ${getCtaButton(resumeUrl, "Bestellung abschließen")}
      ${getSignature()}
    </div>
    ${getEmailFooter()}
  `;
  return {
    subject: `Letzte Erinnerung: Anfrage ${orderReference} läuft heute ab`,
    timing: "72 Stunden nach Sitzung",
    icon: XCircle,
    htmlBody: wrapEmailContent(content, { preheader: "Letzte Chance – Ihre Daten werden heute gelöscht" }),
  };
}

function getOrderConfirmationTemplate(hasDocument: boolean) {
  const order = mockOrder;
  
  // Format address
  const addressDisplay = order.adresse 
    ? `${order.adresse}${order.wohnungs_hinweis ? `, ${order.wohnungs_hinweis}` : ''}<br>${order.plz} ${order.ort}`
    : `${order.katastralgemeinde}<br>EZ ${order.grundstuecksnummer}`;

  if (!hasDocument) {
    // Manual processing email - new format
    const content = `
      ${getEmailHeader()}
      ${getRefBanner(order.order_number)}
      <div class="content">
        <p class="greeting">Sehr geehrte/r ${order.vorname} ${order.nachname},</p>
        
        <p>Vielen Dank für Ihre Bestellung. <strong>Ihre Bestellung wird manuell bearbeitet.</strong> Die Dokumente werden innerhalb von 24 Stunden per E-Mail bereitgestellt.</p>
        
        <div style="margin: 24px 0; padding: 16px 0; border-top: 1px solid ${BRAND_COLORS.borderLight}; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">
          <div style="padding-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: ${BRAND_COLORS.textMuted};">Objekt</p>
            <p style="margin: 0; font-size: 14px; color: ${BRAND_COLORS.text}; line-height: 1.5;">${addressDisplay}</p>
          </div>
          <div>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: ${BRAND_COLORS.textMuted};">Produkt</p>
            <p style="margin: 0; font-size: 14px; color: ${BRAND_COLORS.text};">${order.product_name}</p>
          </div>
        </div>
        
        ${getPaymentDetailsBox(order.order_number, `€ ${order.product_price.toFixed(2).replace('.', ',')}`)}
        
        ${getSignature()}
      </div>
      ${getEmailFooter()}
    `;
    
    return {
      subject: `Bestellbestätigung – ${order.order_number}`,
      timing: "Direkt nach Bestellung",
      icon: AlertTriangle,
      htmlBody: wrapEmailContent(content, { 
        preheader: "Ihre Bestellung wird manuell bearbeitet" 
      }),
    };
  }
  
  // With document - simplified version
  const productSummary = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0; background-color: ${BRAND_COLORS.surface}; border-radius: 4px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="font-size: 14px; color: ${BRAND_COLORS.textSecondary};">
                ${order.product_name}<br>
                <span style="font-size: 13px; color: ${BRAND_COLORS.textMuted};">KG ${order.katastralgemeinde} · EZ ${order.grundstuecksnummer}</span>
              </td>
              <td style="font-size: 18px; font-weight: 600; color: ${BRAND_COLORS.primary}; text-align: right; vertical-align: top;">
                € ${order.product_price.toFixed(2).replace('.', ',')}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const content = `
    ${getEmailHeader()}
    ${getRefBanner(order.order_number, "Bestellbestätigung")}
    <div class="content">
      <p class="greeting">Sehr geehrte/r ${order.vorname} ${order.nachname},</p>
      <p>Wir bestätigen den Eingang Ihrer Bestellung.</p>
      <p style="color: ${BRAND_COLORS.success}; font-weight: 500;">Ihr Grundbuchauszug liegt dieser E-Mail als PDF bei.</p>
      ${getPaymentDetailsBox(order.order_number)}
      ${productSummary}
      <p style="font-size: 13px; color: ${BRAND_COLORS.textMuted};">
        Eine Rechnung wird Ihnen separat zugestellt.
      </p>
      ${getSignature()}
    </div>
    ${getEmailFooter()}
  `;

  return {
    subject: `Bestellbestätigung – ${order.order_number}`,
    timing: "Direkt nach Bestellung",
    icon: CheckCircle,
    htmlBody: wrapEmailContent(content, { 
      preheader: "Ihr Grundbuchauszug liegt bei" 
    }),
  };
}

function getInternalNotificationTemplate(hasDocument: boolean) {
  const order = mockOrder;
  const documentFetchError = "API timeout - connection refused";
  const currentYear = new Date().getFullYear();
  
  const statusColor = hasDocument ? BRAND_COLORS.success : BRAND_COLORS.error;
  const statusBg = hasDocument ? '#f0fdf4' : BRAND_COLORS.errorBg;
  const statusBorder = hasDocument ? '#bbf7d0' : '#fecaca';
  
  const content = `
<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: ${BRAND_COLORS.text}; max-width: 600px; margin: 0 auto; background-color: #f4f4f5;">
    <div style="background-color: ${BRAND_COLORS.primary}; color: white; padding: 20px 32px;">
      <p style="margin: 0; font-size: 14px; font-weight: 500;">
        ${hasDocument ? '✓' : '!'} Neue Bestellung · ${order.order_number}
      </p>
    </div>
    
    <div style="padding: 32px; background-color: #ffffff;">
      <p style="color: ${BRAND_COLORS.textMuted}; font-size: 13px; margin: 0 0 24px 0;">
        ${new Date(order.created_at).toLocaleString('de-AT', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>
      
      <!-- Status -->
      <div style="background-color: ${statusBg}; border: 1px solid ${statusBorder}; border-radius: 4px; padding: 14px 16px; margin: 0 0 24px 0;">
        <p style="margin: 0; color: ${statusColor}; font-size: 14px; font-weight: 500;">
          ${hasDocument 
            ? '✓ Dokument zugestellt' 
            : `! Manuell zusenden – ${documentFetchError}`}
        </p>
      </div>
      
      <!-- Kunde -->
      <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; width: 35%; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">Name</td>
          <td style="padding: 10px 0; font-size: 14px; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">${order.vorname} ${order.nachname}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">E-Mail</td>
          <td style="padding: 10px 0; font-size: 14px; border-bottom: 1px solid ${BRAND_COLORS.borderLight};"><a href="mailto:${order.email}" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">${order.email}</a></td>
        </tr>
        ${order.firma ? `<tr>
          <td style="padding: 10px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">Firma</td>
          <td style="padding: 10px 0; font-size: 14px; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">${order.firma}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">Land</td>
          <td style="padding: 10px 0; font-size: 14px; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">${order.wohnsitzland}</td>
        </tr>
      </table>
      
      <!-- Grundstück -->
      <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
        ${order.adresse ? `<tr>
          <td style="padding: 10px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; width: 35%; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">Adresse</td>
          <td style="padding: 10px 0; font-size: 14px; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">${order.adresse}, ${order.plz} ${order.ort}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">KG</td>
          <td style="padding: 10px 0; font-size: 14px; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">${order.katastralgemeinde}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">EZ/GST</td>
          <td style="padding: 10px 0; font-size: 14px; font-family: 'SF Mono', Monaco, Consolas, monospace; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">${order.grundstuecksnummer}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">Gericht</td>
          <td style="padding: 10px 0; font-size: 14px; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">${order.grundbuchsgericht}</td>
        </tr>
        ${order.wohnungs_hinweis ? `<tr>
          <td style="padding: 10px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">Hinweis</td>
          <td style="padding: 10px 0; font-size: 14px; font-style: italic; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">${order.wohnungs_hinweis}</td>
        </tr>` : ''}
      </table>
      
      <!-- Betrag -->
      <div style="background-color: ${BRAND_COLORS.surface}; padding: 16px; border-radius: 4px;">
        <table style="width: 100%;">
          <tr>
            <td style="font-size: 14px; color: ${BRAND_COLORS.textMuted};">${order.product_name}</td>
            <td style="font-size: 18px; font-weight: 600; color: ${BRAND_COLORS.primary}; text-align: right;">€ ${order.product_price.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <p style="margin: 24px 0 0 0; font-size: 13px; color: ${BRAND_COLORS.warning};">
        ⏳ Zahlung ausstehend
      </p>
    </div>
    
    <div style="padding: 16px 32px; text-align: center; font-size: 11px; color: ${BRAND_COLORS.textMuted};">
      GrundbuchauszugOnline.at · ${currentYear}
    </div>
  </body>
</html>`;

  return {
    subject: `${hasDocument ? '' : '⚠ '}${order.order_number} · ${order.vorname} ${order.nachname}`,
    timing: "Intern – nach jeder Bestellung",
    icon: Bell,
    htmlBody: content,
  };
}

type TemplateCategory = "abandoned" | "order" | "reports";

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
    { id: "order-manual", ...getOrderConfirmationTemplate(false), label: "Manuell" },
    { id: "internal-success", ...getInternalNotificationTemplate(true), label: "Intern" },
    { id: "internal-error", ...getInternalNotificationTemplate(false), label: "Intern – Aktion" },
  ];

  const reportTemplates = [
    { id: "daily-report", ...getDailyReportTemplate(), label: "Daily Report" },
  ];

  const getTemplates = () => {
    switch (activeCategory) {
      case "abandoned": return abandonedTemplates;
      case "order": return orderTemplates;
      case "reports": return reportTemplates;
    }
  };

  const currentTemplates = getTemplates();
  const currentTemplate = currentTemplates.find(t => t.id === activeTemplate) || currentTemplates[0];

  const handleCategoryChange = (category: TemplateCategory) => {
    setActiveCategory(category);
    if (category === "abandoned") setActiveTemplate("1");
    else if (category === "order") setActiveTemplate("order-success");
    else setActiveTemplate("daily-report");
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
            Vorschau aller automatisierten E-Mails
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
            Bestellungen
          </button>
          <button
            onClick={() => handleCategoryChange("reports")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeCategory === "reports"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4 inline-block mr-2" />
            Rapporten
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
                        <span>info@grundbuchauszugonline.at</span>
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

        {/* Overview Cards */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Übersicht</h3>
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
