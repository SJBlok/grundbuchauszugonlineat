/**
 * Universal Email Template System
 * 
 * Minimalist, professional design with authoritative presence.
 * Clean typography, generous whitespace, refined details.
 */

// Brand colors - refined, minimal palette
const BRAND_COLORS = {
  primary: '#1a5f4a',
  primaryDark: '#134438',
  background: '#ffffff',
  surface: '#fafafa',
  text: '#18181b',
  textSecondary: '#52525b',
  textMuted: '#71717a',
  border: '#e4e4e7',
  borderLight: '#f4f4f5',
  warning: '#b45309',
  warningBg: '#fffbeb',
  error: '#b91c1c',
  errorBg: '#fef2f2',
  success: '#15803d',
};

// Logo URL from Supabase Storage
const LOGO_URL = "https://sclblrqylmzqvbjuegkq.supabase.co/storage/v1/object/public/email-assets/logo.svg";

// Logo in banner style with actual logo image - mobile optimized
const getLogoHtml = () => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="text-align: center;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="display: inline-table;">
        <tr>
          <td style="vertical-align: middle; padding-right: 8px;">
            <img src="${LOGO_URL}" alt="Logo" width="24" height="24" style="display: block; border: 0;" />
          </td>
          <td style="vertical-align: middle;">
            <span style="font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">
              GrundbuchauszugOnline
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;

// Universal email wrapper styles - minimalist
export const getBaseStyles = () => `
  body { 
    margin: 0; 
    padding: 0; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
    background-color: #f4f4f5; 
    color: ${BRAND_COLORS.text}; 
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .wrapper { 
    max-width: 580px; 
    margin: 0 auto; 
    padding: 40px 20px; 
  }
  .container { 
    background-color: ${BRAND_COLORS.background}; 
    border-radius: 4px;
    border: 1px solid ${BRAND_COLORS.border};
  }
  .header { 
    background-color: ${BRAND_COLORS.primary};
    padding: 24px 40px; 
  }
  .ref-banner { 
    background-color: ${BRAND_COLORS.surface}; 
    padding: 16px 40px;
    font-size: 13px; 
    color: ${BRAND_COLORS.textMuted};
    border-bottom: 1px solid ${BRAND_COLORS.borderLight};
  }
  .ref-banner strong {
    color: ${BRAND_COLORS.text};
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    font-size: 12px;
    letter-spacing: 0.3px;
  }
  .content { 
    padding: 40px; 
  }
  .content p { 
    margin: 0 0 20px 0; 
    font-size: 15px; 
    color: ${BRAND_COLORS.textSecondary};
    line-height: 1.7;
  }
  .greeting {
    font-size: 15px;
    font-weight: 500;
    color: ${BRAND_COLORS.text};
    margin-bottom: 24px !important;
  }
  .order-table { 
    width: 100%; 
    border-collapse: collapse; 
    margin: 32px 0;
  }
  .order-table td { 
    padding: 14px 0; 
    font-size: 14px; 
    border-bottom: 1px solid ${BRAND_COLORS.borderLight}; 
    color: ${BRAND_COLORS.textSecondary}; 
    vertical-align: top;
  }
  .order-table tr:first-child td {
    padding-top: 0;
  }
  .order-table tr:last-child td { 
    border-bottom: none;
    padding-bottom: 0;
  }
  .order-table .label { 
    color: ${BRAND_COLORS.textMuted}; 
    width: 40%;
    font-size: 13px;
  }
  .order-table .value { 
    font-weight: 500; 
    color: ${BRAND_COLORS.text}; 
  }
  .total-row td { 
    padding-top: 20px !important; 
    border-top: 1px solid ${BRAND_COLORS.border}; 
    border-bottom: none !important;
  }
  .total-row .label {
    font-weight: 500;
    color: ${BRAND_COLORS.text};
  }
  .total-row .value { 
    font-weight: 600; 
    color: ${BRAND_COLORS.primary}; 
    font-size: 16px; 
  }
  .cta-section { 
    text-align: center; 
    padding: 8px 0 32px 0; 
  }
  .cta-button { 
    display: inline-block; 
    background-color: ${BRAND_COLORS.primary};
    color: #ffffff !important; 
    text-decoration: none; 
    padding: 14px 32px; 
    font-weight: 500; 
    font-size: 14px; 
    border-radius: 4px;
    letter-spacing: 0.2px;
  }
  .notice-box { 
    background-color: ${BRAND_COLORS.surface}; 
    border-left: 2px solid ${BRAND_COLORS.primary}; 
    padding: 16px 20px; 
    margin: 24px 0; 
  }
  .notice-box p { 
    margin: 0; 
    color: ${BRAND_COLORS.textSecondary};
    font-size: 14px;
    line-height: 1.6;
  }
  .notice-box.warning {
    background-color: ${BRAND_COLORS.warningBg};
    border-left-color: ${BRAND_COLORS.warning};
  }
  .notice-box.warning p {
    color: ${BRAND_COLORS.warning};
  }
  .notice-box.error {
    background-color: ${BRAND_COLORS.errorBg};
    border-left-color: ${BRAND_COLORS.error};
  }
  .notice-box.error p {
    color: ${BRAND_COLORS.error};
  }
  .footer { 
    background-color: ${BRAND_COLORS.surface};
    padding: 28px 40px; 
    text-align: center;
    border-top: 1px solid ${BRAND_COLORS.borderLight};
  }
  .footer p { 
    margin: 0; 
    font-size: 12px; 
    color: ${BRAND_COLORS.textMuted}; 
    line-height: 1.8;
  }
  .footer a {
    color: ${BRAND_COLORS.textMuted};
    text-decoration: none;
  }
  .signature {
    margin-top: 36px;
    padding-top: 28px;
    border-top: 1px solid ${BRAND_COLORS.borderLight};
  }
  .signature p {
    margin: 0;
    font-size: 14px;
    color: ${BRAND_COLORS.textSecondary};
    line-height: 1.8;
  }
`;

// Email header with logo
export const getEmailHeader = () => `
<div class="header">
  ${getLogoHtml()}
</div>
`;

// Reference banner
export const getRefBanner = (reference: string, label?: string) => `
<div class="ref-banner">
  ${label ? `<span style="margin-right: 16px;">${label}</span>` : ''}Vorgang <strong>${reference}</strong>
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
    <td class="label">Einlagezahl</td>
    <td class="value" style="font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 13px;">${details.grundstuecksnummer}</td>
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
    <td class="label">Betrag</td>
    <td class="value">${details.price}</td>
  </tr>
</table>
`;

// CTA Button
export const getCtaButton = (url: string, text: string) => `
<div class="cta-section">
  <a href="${url}" class="cta-button">${text}</a>
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
  <p>Mit freundlichen Grüßen</p>
  <p style="font-weight: 500; color: ${BRAND_COLORS.text}; margin-top: 4px;">Ihr Grundbuchservice-Team</p>
</div>
`;

// Email footer
export const getEmailFooter = () => {
  const currentYear = new Date().getFullYear();
  return `
<div class="footer">
  <p>
    <a href="mailto:info@grundbuchauszugonline.at">info@grundbuchauszugonline.at</a>
  </p>
  <p style="margin-top: 12px;">
    <a href="https://grundbuchauszugonline.at/agb">AGB</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="https://grundbuchauszugonline.at/datenschutz">Datenschutz</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="https://grundbuchauszugonline.at/impressum">Impressum</a>
  </p>
  <p style="margin-top: 16px; font-size: 11px; color: #a1a1aa;">
    © ${currentYear} GrundbuchauszugOnline.at · Unabhängiger Online-Dienstleister
  </p>
</div>
`;
};

// Payment details box - minimalist
export const getPaymentDetailsBox = (orderNumber: string, amount?: string) => `
<p style="margin: 0 0 16px 0; font-size: 14px; color: ${BRAND_COLORS.textSecondary}; line-height: 1.6;">
  Um die Bestellung vollständig abzuschließen, schließen Sie bitte die Zahlung ab.
</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 32px 0;">
  <tr>
    <td style="background-color: ${BRAND_COLORS.surface}; padding: 24px; border: 1px solid ${BRAND_COLORS.border}; border-radius: 4px;">
      <p style="margin: 0 0 16px 0; font-size: 13px; font-weight: 500; color: ${BRAND_COLORS.text}; text-transform: uppercase; letter-spacing: 0.5px;">
        Zahlungsinformationen
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${amount ? `
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted};">Betrag</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: ${BRAND_COLORS.primary}; text-align: right;">${amount}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted};">Empfänger</td>
          <td style="padding: 8px 0; font-size: 14px; color: ${BRAND_COLORS.text}; text-align: right;">Application Assistant Ltd</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted};">IBAN</td>
          <td style="padding: 8px 0; font-size: 13px; color: ${BRAND_COLORS.text}; font-family: 'SF Mono', Monaco, Consolas, monospace; text-align: right;">DE56 2022 0800 0058 7945 48</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted};">BIC</td>
          <td style="padding: 8px 0; font-size: 13px; color: ${BRAND_COLORS.text}; font-family: 'SF Mono', Monaco, Consolas, monospace; text-align: right;">SXPYDEHHXXX</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: ${BRAND_COLORS.textMuted};">Verwendungszweck</td>
          <td style="padding: 8px 0; font-size: 14px; color: ${BRAND_COLORS.text}; font-weight: 500; text-align: right;">${orderNumber}</td>
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

export { BRAND_COLORS };
