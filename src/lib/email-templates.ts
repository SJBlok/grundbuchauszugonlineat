/**
 * Universal Email Template System
 * 
 * Provides consistent branding, styling, and professional authority across all emails.
 * Based on the website's design system with teal-green primary color scheme.
 */

// Brand colors matching the website
const BRAND_COLORS = {
  primary: '#166449',
  primaryDark: '#0d4a35',
  primaryLight: '#1a7a59',
  background: '#f8fafb',
  white: '#ffffff',
  text: '#1f2937',
  textLight: '#4b5563',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  accent: '#064e3b',
  warning: '#92400e',
  warningBg: '#fffbeb',
  warningBorder: '#fcd34d',
  error: '#991b1b',
  errorBg: '#fef2f2',
  errorBorder: '#fecaca',
  success: '#065f46',
  successBg: '#d1fae5',
  successBorder: '#10b981',
};

// SVG Logo inline (Austrian flag inspired document icon)
const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 40" width="180" height="40">
  <!-- Document icon with Austrian colors -->
  <rect x="0" y="4" width="32" height="32" rx="4" fill="${BRAND_COLORS.primary}"/>
  <rect x="4" y="8" width="24" height="5" rx="1" fill="#ed1c24"/>
  <rect x="4" y="15" width="24" height="5" rx="1" fill="#ffffff"/>
  <rect x="4" y="22" width="24" height="5" rx="1" fill="#ed1c24"/>
  <path d="M12 28 L20 28 L20 32 L12 32 Z" fill="${BRAND_COLORS.primaryDark}"/>
  
  <!-- Brand text -->
  <text x="40" y="26" font-family="Georgia, 'Times New Roman', serif" font-size="16" font-weight="700" fill="${BRAND_COLORS.text}">
    Grundbuchauszug<tspan fill="${BRAND_COLORS.primary}">Online</tspan>.at
  </text>
</svg>
`;

// Base64 encoded simple logo for email compatibility
const getLogoHtml = () => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="padding-right: 12px; vertical-align: middle;">
      <div style="width: 44px; height: 44px; background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="44" height="44">
          <tr><td height="8"></td></tr>
          <tr>
            <td align="center">
              <div style="width: 28px; height: 6px; background: #ed1c24; border-radius: 2px; margin-bottom: 3px;"></div>
              <div style="width: 28px; height: 6px; background: #ffffff; border-radius: 2px; margin-bottom: 3px;"></div>
              <div style="width: 28px; height: 6px; background: #ed1c24; border-radius: 2px;"></div>
            </td>
          </tr>
        </table>
      </div>
    </td>
    <td style="vertical-align: middle;">
      <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; color: ${BRAND_COLORS.text}; letter-spacing: -0.3px;">
        Grundbuchauszug<span style="color: ${BRAND_COLORS.primary};">Online</span><span style="color: ${BRAND_COLORS.textMuted}; font-weight: 400;">.at</span>
      </span>
    </td>
  </tr>
</table>
`;

// Universal email wrapper styles
export const getBaseStyles = () => `
  body { 
    margin: 0; 
    padding: 0; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
    background-color: ${BRAND_COLORS.background}; 
    color: ${BRAND_COLORS.text}; 
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  .wrapper { 
    max-width: 640px; 
    margin: 0 auto; 
    padding: 32px 16px; 
  }
  .container { 
    background-color: ${BRAND_COLORS.white}; 
    border-radius: 8px; 
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.03);
  }
  .header { 
    background: linear-gradient(180deg, ${BRAND_COLORS.white} 0%, #f9fafb 100%);
    padding: 28px 32px; 
    border-bottom: 1px solid ${BRAND_COLORS.border};
  }
  .header-badge {
    display: inline-block;
    background-color: ${BRAND_COLORS.primary}10;
    color: ${BRAND_COLORS.primary};
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 4px 10px;
    border-radius: 4px;
    margin-top: 8px;
  }
  .ref-banner { 
    background-color: ${BRAND_COLORS.primary}; 
    padding: 14px 32px;
    font-size: 13px; 
    color: ${BRAND_COLORS.white};
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ref-banner strong {
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    letter-spacing: 0.5px;
  }
  .content { 
    padding: 36px 32px; 
  }
  .content p { 
    margin: 0 0 18px 0; 
    font-size: 15px; 
    color: ${BRAND_COLORS.textLight};
    line-height: 1.7;
  }
  .content p:last-child {
    margin-bottom: 0;
  }
  .greeting {
    font-size: 16px;
    font-weight: 600;
    color: ${BRAND_COLORS.text};
    margin-bottom: 20px !important;
  }
  .order-table { 
    width: 100%; 
    border-collapse: collapse; 
    margin: 28px 0;
    background-color: #fafbfc;
    border-radius: 8px;
    overflow: hidden;
  }
  .order-table td { 
    padding: 14px 16px; 
    font-size: 14px; 
    border-bottom: 1px solid ${BRAND_COLORS.borderLight}; 
    color: ${BRAND_COLORS.textLight}; 
  }
  .order-table tr:last-child td { 
    border-bottom: none; 
  }
  .order-table .label { 
    color: ${BRAND_COLORS.textMuted}; 
    width: 42%;
    font-size: 13px;
  }
  .order-table .value { 
    font-weight: 600; 
    color: ${BRAND_COLORS.text}; 
  }
  .total-row td { 
    padding-top: 18px; 
    border-top: 2px solid ${BRAND_COLORS.border}; 
    border-bottom: none;
    background-color: ${BRAND_COLORS.white};
  }
  .total-row .label {
    font-weight: 600;
    color: ${BRAND_COLORS.text};
    font-size: 14px;
  }
  .total-row .value { 
    font-weight: 700; 
    color: ${BRAND_COLORS.primary}; 
    font-size: 18px; 
  }
  .cta-section { 
    text-align: center; 
    padding: 12px 0 28px 0; 
  }
  .cta-button { 
    display: inline-block; 
    background: linear-gradient(180deg, ${BRAND_COLORS.primaryLight} 0%, ${BRAND_COLORS.primary} 100%);
    color: ${BRAND_COLORS.white} !important; 
    text-decoration: none; 
    padding: 16px 36px; 
    font-weight: 600; 
    font-size: 15px; 
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(22, 100, 73, 0.2), 0 4px 12px rgba(22, 100, 73, 0.15);
    transition: all 0.2s;
  }
  .cta-button:hover {
    box-shadow: 0 4px 8px rgba(22, 100, 73, 0.25), 0 8px 20px rgba(22, 100, 73, 0.2);
  }
  .notice-box { 
    background-color: #f0fdf4; 
    border-left: 4px solid ${BRAND_COLORS.primary}; 
    padding: 18px 20px; 
    margin: 24px 0; 
    border-radius: 0 6px 6px 0;
  }
  .notice-box p { 
    margin: 0; 
    color: ${BRAND_COLORS.accent};
    font-size: 14px;
    line-height: 1.6;
  }
  .notice-box.warning {
    background-color: ${BRAND_COLORS.warningBg};
    border-left-color: #f59e0b;
  }
  .notice-box.warning p {
    color: ${BRAND_COLORS.warning};
  }
  .notice-box.error {
    background-color: ${BRAND_COLORS.errorBg};
    border-left-color: #ef4444;
  }
  .notice-box.error p {
    color: ${BRAND_COLORS.error};
  }
  .footer { 
    background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
    padding: 28px 32px; 
    text-align: center;
    border-top: 1px solid ${BRAND_COLORS.border};
  }
  .footer p { 
    margin: 0 0 6px 0; 
    font-size: 13px; 
    color: ${BRAND_COLORS.textMuted}; 
  }
  .footer-links {
    margin: 16px 0;
  }
  .footer-links a {
    color: ${BRAND_COLORS.primary};
    text-decoration: none;
    font-size: 13px;
    margin: 0 12px;
  }
  .footer-disclaimer { 
    margin-top: 16px; 
    padding-top: 16px; 
    border-top: 1px solid ${BRAND_COLORS.border}; 
    font-size: 11px; 
    color: #9ca3af;
    line-height: 1.5;
  }
  .signature {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid ${BRAND_COLORS.borderLight};
  }
  .signature p {
    margin: 0;
    font-size: 14px;
    color: ${BRAND_COLORS.textLight};
  }
  .signature .name {
    font-weight: 600;
    color: ${BRAND_COLORS.primary};
    font-size: 15px;
  }
`;

// Email header with logo
export const getEmailHeader = (badge?: string) => `
<div class="header">
  ${getLogoHtml()}
  ${badge ? `<div class="header-badge">${badge}</div>` : ''}
</div>
`;

// Reference banner
export const getRefBanner = (reference: string, additionalInfo?: string) => `
<div class="ref-banner">
  <span>Vorgangs-Nr.: <strong>${reference}</strong></span>
  ${additionalInfo ? `<span style="font-size: 12px; opacity: 0.9;">${additionalInfo}</span>` : ''}
</div>
`;

// Order details table
export const getOrderDetailsTable = (details: {
  product: string;
  katastralgemeinde: string;
  grundstuecksnummer: string;
  grundbuchsgericht: string;
  bundesland: string;
  adresse?: string;
  price: string;
}) => `
<table class="order-table">
  <tr>
    <td class="label">Produkt</td>
    <td class="value">${details.product}</td>
  </tr>
  <tr>
    <td class="label">Katastralgemeinde</td>
    <td class="value">${details.katastralgemeinde}</td>
  </tr>
  <tr>
    <td class="label">Einlagezahl / GST-Nr.</td>
    <td class="value" style="font-family: 'SF Mono', Monaco, Consolas, monospace;">${details.grundstuecksnummer}</td>
  </tr>
  <tr>
    <td class="label">Bezirksgericht</td>
    <td class="value">${details.grundbuchsgericht}</td>
  </tr>
  <tr>
    <td class="label">Bundesland</td>
    <td class="value">${details.bundesland}</td>
  </tr>
  ${details.adresse ? `
  <tr>
    <td class="label">Adresse</td>
    <td class="value">${details.adresse}</td>
  </tr>
  ` : ''}
  <tr class="total-row">
    <td class="label">Gesamtbetrag</td>
    <td class="value">${details.price}</td>
  </tr>
</table>
`;

// CTA Button
export const getCtaButton = (url: string, text: string) => `
<div class="cta-section">
  <a href="${url}" class="cta-button">${text} →</a>
</div>
`;

// Notice box
export const getNoticeBox = (content: string, type: 'info' | 'warning' | 'error' = 'info') => `
<div class="notice-box ${type}">
  <p>${content}</p>
</div>
`;

// Email signature
export const getSignature = () => `
<div class="signature">
  <p>Mit freundlichen Grüßen,</p>
  <p class="name" style="margin-top: 8px;">Ihr Grundbuchservice-Team</p>
  <p style="font-size: 13px; color: ${BRAND_COLORS.textMuted}; margin-top: 4px;">GrundbuchauszugOnline.at</p>
</div>
`;

// Email footer
export const getEmailFooter = () => {
  const currentYear = new Date().getFullYear();
  return `
<div class="footer">
  <p style="font-weight: 600; color: ${BRAND_COLORS.text};">GrundbuchauszugOnline.at</p>
  <p>
    <a href="mailto:info@grundbuchauszugonline.at" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">
      info@grundbuchauszugonline.at
    </a>
  </p>
  <div class="footer-links">
    <a href="https://grundbuchauszugonline.at/agb">AGB</a>
    <a href="https://grundbuchauszugonline.at/datenschutz">Datenschutz</a>
    <a href="https://grundbuchauszugonline.at/impressum">Impressum</a>
  </div>
  <div class="footer-disclaimer">
    © ${currentYear} GrundbuchauszugOnline.at – Ihr Partner für Grundbuchauszüge in Österreich<br>
    Wir sind ein unabhängiger, kommerzieller Online-Dienstleister und keine staatliche Stelle.
  </div>
</div>
`;
};

// Payment details box
export const getPaymentDetailsBox = (orderNumber: string) => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND_COLORS.warningBg}; border: 1px solid ${BRAND_COLORS.warningBorder}; border-radius: 8px; margin: 24px 0;">
  <tr>
    <td style="padding: 24px;">
      <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: ${BRAND_COLORS.warning}; text-transform: uppercase; letter-spacing: 0.5px;">
        💳 Zahlungsanweisung
      </h3>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #78350f; line-height: 1.5;">
        Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen auf folgendes Konto:
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND_COLORS.white}; border-radius: 6px;">
        <tr>
          <td style="padding: 16px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #78350f;">Empfänger</td>
                <td style="padding: 8px 0; font-size: 14px; color: ${BRAND_COLORS.text}; font-weight: 600; text-align: right;">Application Assistant Ltd</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #78350f;">IBAN</td>
                <td style="padding: 8px 0; font-size: 14px; color: ${BRAND_COLORS.text}; font-weight: 600; font-family: 'SF Mono', Monaco, Consolas, monospace; text-align: right;">DE56 2022 0800 0058 7945 48</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #78350f;">BIC</td>
                <td style="padding: 8px 0; font-size: 14px; color: ${BRAND_COLORS.text}; font-weight: 600; font-family: 'SF Mono', Monaco, Consolas, monospace; text-align: right;">SXPYDEHHXXX</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #78350f;">Verwendungszweck</td>
                <td style="padding: 8px 0; font-size: 14px; color: ${BRAND_COLORS.text}; font-weight: 600; text-align: right;">${orderNumber}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;

// Full email template wrapper
export const wrapEmailContent = (content: string, options?: { preheader?: string }) => `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>GrundbuchauszugOnline.at</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>${getBaseStyles()}</style>
</head>
<body>
  ${options?.preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${options.preheader}</div>` : ''}
  <div class="wrapper">
    <div class="container">
      ${content}
    </div>
  </div>
</body>
</html>
`;

// Export brand colors for use elsewhere
export { BRAND_COLORS };
