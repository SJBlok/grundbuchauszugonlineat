import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROXY_URL = Deno.env.get("UVST_PROXY_URL") || "https://uvst-proxy-production.up.railway.app";

// ── Helpers ──

function titleCase(str: string): string {
  return str.toLowerCase().replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}

function splitAddress(adresse: string): { strasse: string; hausnummer: string } {
  const trimmed = adresse.trim();
  const match = trimmed.match(/^(.+?)\s+(\d+\S*)$/);
  if (match) {
    return { strasse: titleCase(match[1]), hausnummer: match[2] };
  }
  return { strasse: titleCase(trimmed), hausnummer: "" };
}

async function normalizeWithNominatim(
  strasse: string,
  hausnummer?: string,
  plz?: string,
  ort?: string
): Promise<{ strasse: string; hausnummer: string; ort: string; bundesland: string; isOrtschaft: boolean } | null> {
  try {
    const query = [strasse, hausnummer, plz, ort, "Austria"].filter(Boolean).join(", ");
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
        q: query,
        format: "json",
        addressdetails: "1",
        limit: "1",
        countrycodes: "at",
      })}`,
      { headers: { "User-Agent": "GrundbuchauszugOnline/1.0" } }
    );
    if (!res.ok) return null;
    const results = await res.json();
    if (!results.length) return null;
    const addr = results[0].address;
    const hasRoad = !!addr.road;
    return {
      strasse: titleCase(addr.road || addr.locality || strasse),
      hausnummer: addr.house_number || hausnummer || "",
      ort: addr.town || addr.city || ort || "",
      bundesland: addr.state || "",
      isOrtschaft: !hasRoad && !!addr.locality,
    };
  } catch {
    return null;
  }
}

async function proxyPost(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(`${PROXY_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error?.errorMsg || data?.error || `Proxy error ${res.status}`);
  }
  return data;
}

function parseAddressResults(xmlString: string) {
  const results: Array<{ kgNummer: string; einlagezahl: string; kgName: string }> = [];
  const ergebnisBlocks = xmlString.match(/<Ergebnis[\s\S]*?<\/Ergebnis>/g) || [];
  for (const block of ergebnisBlocks) {
    const kgNummer = block.match(/<Katastralgemeindenummer>(\d+)<\/Katastralgemeindenummer>/)?.[1] || "";
    const kgName = block.match(/<Katastralgemeindebezeichnung>([^<]+)<\/Katastralgemeindebezeichnung>/)?.[1] || "";
    const einlagezahl = block.match(/<Einlagezahl>(\d+)<\/Einlagezahl>/)?.[1] || "";
    if (kgNummer && einlagezahl) {
      results.push({ kgNummer, einlagezahl, kgName });
    }
  }
  return results;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let orderId: string | undefined;

  try {
    const body = await req.json();
    orderId = body.order_id;
    if (!orderId) throw new Error("order_id is required");

    // Fetch order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) throw new Error(`Order not found: ${orderErr?.message}`);

    console.log(`[process-order] Processing ${order.order_number} for ${order.email}`);

    const isHistorisch = order.product_name?.toLowerCase().includes("historisch");
    const wantsSignatur = order.amtliche_signatur === true;
    let kgNummer = order.katastralgemeinde?.trim() || "";
    let ezNummer = order.grundstuecksnummer?.trim() || "";

    // ── Step 1: Resolve KG/EZ ──
    if (kgNummer && ezNummer) {
      try {
        console.log(`[process-order] Validating KG ${kgNummer} / EZ ${ezNummer}`);
        await proxyPost("/api/einlage-validate", {
          katastralgemeinde: kgNummer,
          einlagezahl: ezNummer,
        });
        console.log(`[process-order] Validation OK`);
      } catch (valErr: any) {
        console.warn(`[process-order] Validation failed: ${valErr.message}, trying address search`);
        kgNummer = "";
        ezNummer = "";
      }
    }

    if (!kgNummer || !ezNummer) {
      const adresse = order.adresse || "";
      if (!adresse) {
        throw new Error("Keine KG/EZ und keine Adresse vorhanden — manuelle Bearbeitung erforderlich");
      }

      console.log(`[process-order] Searching address: ${adresse}, ${order.plz} ${order.ort}`);
      const { strasse, hausnummer } = splitAddress(adresse);

      // Nominatim pre-processing
      const normalized = await normalizeWithNominatim(strasse, hausnummer, order.plz || undefined, order.ort || undefined);

      let searchResult;
      if (normalized) {
        console.log(`[process-order] Nominatim result: isOrtschaft=${normalized.isOrtschaft}, strasse=${normalized.strasse}`);
        if (normalized.isOrtschaft) {
          console.log(`[process-order] Ortschaft detected, using erweiterte Suche`);
          searchResult = await proxyPost("/api/address-search", {
            strasse: normalized.strasse,
            hausnummer: normalized.hausnummer || undefined,
            ort: normalized.strasse,
            bundesland: normalized.bundesland || order.bundesland || undefined,
            sucheErweitert: true,
          });
        } else {
          searchResult = await proxyPost("/api/address-search", {
            strasse: normalized.strasse,
            hausnummer: normalized.hausnummer || undefined,
            ort: normalized.ort || order.ort || undefined,
            bundesland: normalized.bundesland || order.bundesland || undefined,
          });
        }
      } else {
        console.warn(`[process-order] Nominatim unavailable, falling back to direct search`);
        searchResult = await proxyPost("/api/address-search", {
          bundesland: order.bundesland || undefined,
          ort: order.ort || undefined,
          strasse,
          hausnummer: hausnummer || undefined,
        });
      }

      const results = parseAddressResults(searchResult.data?.responseDecoded || "");
      if (results.length === 0) {
        throw new Error(`Keine Treffer für "${adresse}, ${order.plz} ${order.ort}" — manuelle Bearbeitung erforderlich`);
      }

      kgNummer = results[0].kgNummer;
      ezNummer = results[0].einlagezahl;
      console.log(`[process-order] Found KG ${kgNummer} (${results[0].kgName}) / EZ ${ezNummer}`);

      await supabase
        .from("orders")
        .update({ katastralgemeinde: kgNummer, grundstuecksnummer: ezNummer })
        .eq("id", order.id);
    }

    // ── Step 2: Fetch Grundbuchauszug ──
    console.log(`[process-order] Fetching ${isHistorisch ? "GT_GBP" : "GT_GBA"} KG ${kgNummer} / EZ ${ezNummer} signiert=${wantsSignatur}`);
    const extractResult = await proxyPost("/api/property-extract", {
      katastralgemeinde: kgNummer,
      einlagezahl: ezNummer,
      historisch: isHistorisch,
      signiert: wantsSignatur,
    });

    const kosten = extractResult.data?.ergebnis?.kosten?.gesamtKostenInklUst || 0;

    let pdfBase64 = "";
    if (isHistorisch) {
      const match = extractResult.data?.responseDecoded?.match(
        /<(?:ns2:)?PDFOutStream>([\s\S]*?)<\/(?:ns2:)?PDFOutStream>/
      );
      pdfBase64 = match?.[1]?.trim() || "";
    } else {
      pdfBase64 = extractResult.data?.response || "";
    }

    if (!pdfBase64) {
      throw new Error("Kein PDF in der UVST-Antwort gefunden");
    }

    console.log(`[process-order] PDF received, cost: €${kosten}`);

    // ── Step 3: Upload to Supabase Storage ──
    const type = isHistorisch ? "historisch" : "aktuell";
    const fileName = `grundbuch_${kgNummer}_${ezNummer}_${type}${wantsSignatur ? "_signiert" : ""}.pdf`;
    const storagePath = `${order.order_number}/${Date.now()}_${fileName}`;

    const pdfBytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));

    const { error: uploadErr } = await supabase.storage
      .from("order-documents")
      .upload(storagePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

    const { data: signedData } = await supabase.storage
      .from("order-documents")
      .createSignedUrl(storagePath, 365 * 24 * 60 * 60);

    const { data: publicData } = supabase.storage
      .from("order-documents")
      .getPublicUrl(storagePath);

    const docEntry = {
      name: fileName,
      url: signedData?.signedUrl || publicData.publicUrl,
      storage_path: storagePath,
      type: "application/pdf",
      size: pdfBytes.length,
      added_at: new Date().toISOString(),
    };

    // Update order: add document, set status, add notes
    const existingDocs = Array.isArray(order.documents) ? order.documents : [];
    const updatedDocs = [...existingDocs, docEntry];
    const timestamp = new Date().toLocaleString("de-AT", { timeZone: "Europe/Vienna" });
    const costNote = `[${timestamp}] AUTO: UVST ${isHistorisch ? "GT_GBP" : "GT_GBA"} abgerufen — KG ${kgNummer} / EZ ${ezNummer}${wantsSignatur ? " (signiert)" : ""} — Kosten: €${kosten.toFixed(2)}`;

    await supabase
      .from("orders")
      .update({
        documents: updatedDocs,
        status: "processed",
        document_visible: order.digital_storage_subscription ? true : false,
        processing_notes: order.processing_notes
          ? `${order.processing_notes}\n${costNote}`
          : costNote,
      })
      .eq("id", order.id);

    console.log(`[process-order] Document uploaded, status → processed`);

    // ── Step 4: Send email to customer ──
    try {
      const sendRes = await fetch(
        `${supabaseUrl}/functions/v1/send-grundbuch-document`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            order_id: order.id,
            pdf_base64: pdfBase64,
            document_type: type,
          }),
        }
      );

      const sendData = await sendRes.json();
      if (sendData.error) {
        console.error(`[process-order] Email error: ${sendData.error}`);
      } else {
        console.log(`[process-order] Email sent to ${order.email}`);
      }
    } catch (emailErr: any) {
      console.error(`[process-order] Email failed (non-blocking): ${emailErr.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_number: order.order_number,
        kg: kgNummer,
        ez: ezNummer,
        kosten,
        document: docEntry.name,
        email_sent: true,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error(`[process-order] ERROR: ${err.message}`);

    // Try to add error note to order
    if (orderId) {
      try {
        const { data: o } = await supabase
          .from("orders")
          .select("processing_notes")
          .eq("id", orderId)
          .single();

        const timestamp = new Date().toLocaleString("de-AT", { timeZone: "Europe/Vienna" });
        const errorNote = `[${timestamp}] AUTO FEHLGESCHLAGEN: ${err.message}`;
        await supabase
          .from("orders")
          .update({
            processing_notes: o?.processing_notes
              ? `${o.processing_notes}\n${errorNote}`
              : errorNote,
          })
          .eq("id", orderId);
      } catch {
        // Ignore error-logging errors
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
