/**
 * Daily Order Report Email Template
 * Used for the daily 08:00 order summary email
 */

import { BarChart3 } from "lucide-react";

const BRAND_COLORS = {
  primary: '#1a5f4a',
  background: '#ffffff',
  surface: '#fafafa',
  text: '#18181b',
  textSecondary: '#52525b',
  textMuted: '#71717a',
  border: '#e4e4e7',
  borderLight: '#f4f4f5',
};

const LOGO_URL = "https://sclblrqylmzqvbjuegkq.supabase.co/storage/v1/object/public/email-assets/logo.svg";

// Mock data for preview
const mockOrders = [
  {
    order_number: "GB-100234",
    vorname: "Max",
    nachname: "Mustermann",
    katastralgemeinde: "Wien, Innere Stadt",
    grundstuecksnummer: "1234/5",
    product_price: 23.88,
    status: "pending",
  },
  {
    order_number: "GB-100235",
    vorname: "Anna",
    nachname: "Schmidt",
    katastralgemeinde: "Graz, St. Leonhard",
    grundstuecksnummer: "567/8",
    product_price: 23.88,
    status: "completed",
  },
  {
    order_number: "GB-100236",
    vorname: "Thomas",
    nachname: "Huber",
    katastralgemeinde: "Salzburg, Altstadt",
    grundstuecksnummer: "890/1",
    product_price: 23.88,
    status: "pending",
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

export function getDailyReportTemplate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const reportDate = yesterday.toLocaleDateString('de-AT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.product_price, 0);

  const ordersTableRows = mockOrders.map(order => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND_COLORS.borderLight}; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 13px; color: ${BRAND_COLORS.text};">${order.order_number}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND_COLORS.borderLight}; font-size: 14px; color: ${BRAND_COLORS.textSecondary};">${order.vorname} ${order.nachname}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND_COLORS.borderLight}; font-size: 14px; color: ${BRAND_COLORS.textSecondary};">${order.katastralgemeinde}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND_COLORS.borderLight}; font-size: 14px; color: ${BRAND_COLORS.textSecondary};">${order.grundstuecksnummer}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND_COLORS.borderLight}; font-size: 14px; color: ${BRAND_COLORS.text}; text-align: right;">${formatCurrency(order.product_price)}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND_COLORS.borderLight}; font-size: 13px; color: ${BRAND_COLORS.textMuted};">${order.status}</td>
    </tr>
  `).join('');

  const htmlBody = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Order Report - ${reportDate}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; color: ${BRAND_COLORS.text}; line-height: 1.65;">
  <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: ${BRAND_COLORS.background}; border-radius: 4px; border: 1px solid ${BRAND_COLORS.border};">
      
      <!-- Header -->
      <div style="background-color: ${BRAND_COLORS.primary}; padding: 24px 40px; border-radius: 4px 4px 0 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="display: inline-table;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <img src="${LOGO_URL}" alt="Logo" width="28" height="28" style="display: block; border: 0;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">
                      GrundbuchauszugOnline
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <!-- Report Header -->
      <div style="background-color: ${BRAND_COLORS.surface}; padding: 20px 40px; border-bottom: 1px solid ${BRAND_COLORS.borderLight};">
        <p style="margin: 0; font-size: 13px; color: ${BRAND_COLORS.textMuted};">
          Daily Order Report · <strong style="color: ${BRAND_COLORS.text};">${reportDate}</strong>
        </p>
      </div>

      <!-- Content -->
      <div style="padding: 40px;">
        
        <!-- Summary Cards -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
          <tr>
            <td style="width: 50%; padding-right: 12px;">
              <div style="background-color: ${BRAND_COLORS.surface}; border: 1px solid ${BRAND_COLORS.border}; border-radius: 4px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: 32px; font-weight: 600; color: ${BRAND_COLORS.primary};">${mockOrders.length}</p>
                <p style="margin: 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">Orders</p>
              </div>
            </td>
            <td style="width: 50%; padding-left: 12px;">
              <div style="background-color: ${BRAND_COLORS.surface}; border: 1px solid ${BRAND_COLORS.border}; border-radius: 4px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: 32px; font-weight: 600; color: ${BRAND_COLORS.primary};">${formatCurrency(totalRevenue)}</p>
                <p style="margin: 0; font-size: 13px; color: ${BRAND_COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">Revenue</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Orders Table -->
        <p style="margin: 0 0 16px 0; font-size: 13px; font-weight: 500; color: ${BRAND_COLORS.text}; text-transform: uppercase; letter-spacing: 0.5px;">Order Overview</p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid ${BRAND_COLORS.border}; border-radius: 4px; overflow: hidden;">
          <thead>
            <tr style="background-color: ${BRAND_COLORS.surface};">
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 500; color: ${BRAND_COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid ${BRAND_COLORS.border};">Order No.</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 500; color: ${BRAND_COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid ${BRAND_COLORS.border};">Customer</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 500; color: ${BRAND_COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid ${BRAND_COLORS.border};">KG</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 500; color: ${BRAND_COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid ${BRAND_COLORS.border};">EZ</th>
              <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 500; color: ${BRAND_COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid ${BRAND_COLORS.border};">Amount</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 500; color: ${BRAND_COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid ${BRAND_COLORS.border};">Status</th>
            </tr>
          </thead>
          <tbody>
            ${ordersTableRows}
          </tbody>
        </table>

      </div>

      <!-- Footer -->
      <div style="background-color: ${BRAND_COLORS.surface}; padding: 28px 40px; text-align: center; border-top: 1px solid ${BRAND_COLORS.borderLight}; border-radius: 0 0 4px 4px;">
        <p style="margin: 0; font-size: 12px; color: ${BRAND_COLORS.textMuted}; line-height: 1.8;">
          Automatically generated by GrundbuchauszugOnline.at
        </p>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #a1a1aa;">
          © ${new Date().getFullYear()} GrundbuchauszugOnline.at
        </p>
      </div>

    </div>
  </div>
</body>
</html>
`;

  return {
    subject: `Grundbuch Daily Orders - ${reportDate}`,
    timing: "Daily at 08:00",
    icon: BarChart3,
    htmlBody,
  };
}
