import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
    authHeader.replace("Bearer ", "")
  );

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Check admin
  const { data: adminCheck } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminCheck) {
    return new Response(JSON.stringify({ error: "Not an admin" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const orderId = formData.get("order_id") as string;
    const orderNumber = formData.get("order_number") as string;

    if (!file || !orderId) {
      return new Response(JSON.stringify({ error: "file and order_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileName = `${orderNumber || orderId}/${Date.now()}_${file.name}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("order-documents")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("order-documents")
      .getPublicUrl(fileName);

    // Create signed URL that lasts 1 year
    const { data: signedData } = await supabase.storage
      .from("order-documents")
      .createSignedUrl(fileName, 365 * 24 * 60 * 60);

    const docEntry = {
      name: file.name,
      url: signedData?.signedUrl || urlData.publicUrl,
      storage_path: fileName,
      type: file.type,
      size: file.size,
      added_at: new Date().toISOString(),
    };

    // Update order documents array
    const { data: order } = await supabase
      .from("orders")
      .select("documents")
      .eq("id", orderId)
      .single();

    const existingDocs = Array.isArray(order?.documents) ? order.documents : [];
    const updatedDocs = [...existingDocs, docEntry];

    const { error: updateError } = await supabase
      .from("orders")
      .update({ documents: updatedDocs })
      .eq("id", orderId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, document: docEntry }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
