import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const POSTMARK_API_KEY = Deno.env.get("POSTMARK_API_KEY");
const REPORT_EMAIL = "chatgpt3398@gmail.com";

// Brand colors
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

function formatDate(date: Date): string {
  return date.toLocaleDateString('de-AT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

function generateReportHtml(reportDate: string, orders: any[], totalRevenue: number): string {
  const ordersTableRows = orders.length > 0 
    ? orders.map(order => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND_COLORS.borderLight}; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 13px; color: ${BRAND_COLORS.text};">${order.order_number}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND_COLORS.borderLight}; font-size: 14px; color: ${BRAND_COLORS.textSecondary};">${order.vorname} ${order.nachname}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND_COLORS.borderLight}; font-size: 14px; color: ${BRAND_COLORS.textSecondary};">${order.katastralgemeinde}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND_COLORS.borderLight}; font-size: 14px; color: ${BRAND_COLORS.textSecondary};">${order.grundstuecksnummer}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND_COLORS.borderLight}; font-size: 14px; color: ${BRAND_COLORS.text}; text-align: right;">${formatCurrency(order.product_price)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND_COLORS.borderLight}; font-size: 13px; color: ${BRAND_COLORS.textMuted};">${order.status}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="6" style="padding: 24px; text-align: center; color: ${BRAND_COLORS.textMuted}; font-size: 14px;">No orders on this day</td></tr>`;

  return `
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
                <p style="margin: 0 0 4px 0; font-size: 32px; font-weight: 600; color: ${BRAND_COLORS.primary};">${orders.length}</p>
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
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const reportDateStr = yesterday.toISOString().split('T')[0];
    const formattedDate = formatDate(yesterday);

    // Check if report already exists for this date
    const { data: existingReport } = await supabase
      .from("daily_order_reports")
      .select("id, email_sent")
      .eq("report_date", reportDateStr)
      .single();

    if (existingReport?.email_sent) {
      return new Response(
        JSON.stringify({ message: "Report already sent for this date", date: reportDateStr }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch orders from yesterday
    const startOfDay = `${reportDateStr}T00:00:00.000Z`;
    const endOfDay = `${reportDateStr}T23:59:59.999Z`;

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)
      .order("created_at", { ascending: true });

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      throw new Error("Failed to fetch orders");
    }

    const ordersData = orders || [];
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.product_price || 0), 0);

    // Generate email HTML
    const emailHtml = generateReportHtml(formattedDate, ordersData, totalRevenue);

    // Send email via Postmark
    const emailResponse = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": POSTMARK_API_KEY!,
      },
      body: JSON.stringify({
        From: "info@grundbuchauszugonline.at",
        To: REPORT_EMAIL,
        Subject: `Grundbuch Daily Orders - ${formattedDate}`,
        HtmlBody: emailHtml,
        MessageStream: "outbound",
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Postmark error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    // Save or update the report
    const reportData = {
      report_date: reportDateStr,
      orders_count: ordersData.length,
      total_revenue: totalRevenue,
      orders_data: ordersData,
      email_sent: true,
      sent_at: new Date().toISOString(),
    };

    if (existingReport) {
      await supabase
        .from("daily_order_reports")
        .update(reportData)
        .eq("id", existingReport.id);
    } else {
      await supabase
        .from("daily_order_reports")
        .insert([reportData]);
    }

    console.log(`Daily report sent for ${reportDateStr}: ${ordersData.length} orders, ${formatCurrency(totalRevenue)}`);

    return new Response(
      JSON.stringify({
        success: true,
        date: reportDateStr,
        orders_count: ordersData.length,
        total_revenue: totalRevenue,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-daily-order-report:", error);
    return new Response(
      JSON.stringify({ error: error?.message ?? "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
