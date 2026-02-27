import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://grundbuchauszugonline.at",
  "https://www.grundbuchauszugonline.at",
  "https://grundbuchauszugonlineat.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

function isLovablePreview(origin: string): boolean {
  return /^https:\/\/[a-f0-9-]+\.lovableproject\.com$/.test(origin) ||
         /^https:\/\/[a-z0-9-]+-preview--[a-f0-9-]+\.lovable\.app$/.test(origin);
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = (ALLOWED_ORIGINS.includes(origin) || isLovablePreview(origin)) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Fetch order with documents
    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("id, order_number, documents")
      .eq("id", order_id)
      .single();

    if (fetchErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 2. Delete all documents from storage
    const docs = Array.isArray(order.documents) ? order.documents : [];
    if (docs.length > 0) {
      const storagePaths = docs
        .map((doc: any) => doc.storage_path)
        .filter(Boolean);

      if (storagePaths.length > 0) {
        console.log(`Deleting ${storagePaths.length} files from storage...`);
        const { error: storageErr } = await supabase.storage
          .from("order-documents")
          .remove(storagePaths);

        if (storageErr) {
          console.warn("Storage delete error (continuing):", storageErr.message);
        } else {
          console.log(`Deleted ${storagePaths.length} files from order-documents bucket`);
        }
      }
    }

    // 3. Delete status history
    await supabase
      .from("order_status_history")
      .delete()
      .eq("order_id", order_id);

    // 4. Delete the order from database
    const { error: deleteErr } = await supabase
      .from("orders")
      .delete()
      .eq("id", order_id);

    if (deleteErr) {
      throw new Error(`Failed to delete order: ${deleteErr.message}`);
    }

    console.log(`Order ${order.order_number} hard deleted successfully`);

    return new Response(
      JSON.stringify({ success: true, order_number: order.order_number }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Delete order error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
