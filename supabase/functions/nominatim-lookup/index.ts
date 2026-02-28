import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { strasse, hausnummer, plz, ort } = await req.json();

    if (!strasse) {
      return new Response(
        JSON.stringify({ result: null, error: "strasse is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build Nominatim query
    const query = [strasse, hausnummer, plz, ort, "Austria"]
      .filter(Boolean)
      .join(", ");

    console.log(`Nominatim lookup: ${query}`);

    const params = new URLSearchParams({
      q: query,
      format: "json",
      addressdetails: "1",
      limit: "1",
      countrycodes: "at",
    });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: { "User-Agent": "GrundbuchauszugOnline/1.0" },
      }
    );

    if (!res.ok) {
      console.error(`Nominatim error: ${res.status}`);
      return new Response(
        JSON.stringify({ result: null }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results = await res.json();

    if (!results.length) {
      console.log("Nominatim: no results");
      return new Response(
        JSON.stringify({ result: null }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const addr = results[0].address || {};
    const hasRoad = !!addr.road;

    const normalized = {
      strasse: addr.road || addr.locality || strasse,
      hausnummer: addr.house_number || hausnummer || "",
      ort: addr.town || addr.city || ort || "",
      bundesland: addr.state || "",
      isOrtschaft: !hasRoad && !!addr.locality,
    };

    // Title case strasse
    normalized.strasse = normalized.strasse
      .toLowerCase()
      .replace(/(?:^|[\s-])\S/g, (char: string) => char.toUpperCase());

    console.log(`Nominatim result:`, JSON.stringify(normalized));

    return new Response(
      JSON.stringify({ result: normalized }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Nominatim proxy error:", error);
    return new Response(
      JSON.stringify({ result: null, error: error.message }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
