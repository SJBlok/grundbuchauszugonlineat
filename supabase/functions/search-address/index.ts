import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://grundbuchauszugonline.at",
  "https://www.grundbuchauszugonline.at",
  "https://grundbuchauszugonlineat.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

// Additional pattern matching for Lovable preview URLs
function isLovablePreview(origin: string): boolean {
  return /^https:\/\/[a-f0-9-]+\.lovableproject\.com$/.test(origin) ||
         /^https:\/\/[a-z0-9-]+-preview--[a-f0-9-]+\.lovable\.app$/.test(origin);
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  // Allow origin if it's in the list or is a Lovable preview
  const allowedOrigin = (ALLOWED_ORIGINS.includes(origin) || isLovablePreview(origin)) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

function isValidOrigin(req: Request): boolean {
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  
  // Check if origin matches allowed domains or is a Lovable preview
  const isValidOriginHeader = ALLOWED_ORIGINS.some(allowed => origin.includes(new URL(allowed).host)) || isLovablePreview(origin);
  const isValidReferer = ALLOWED_ORIGINS.some(allowed => referer.includes(new URL(allowed).host)) || isLovablePreview(referer);
  
  return isValidOriginHeader || isValidReferer;
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
         req.headers.get("x-real-ip") || 
         "unknown";
}

interface AddressSearchResult {
  kgNummer: string;
  kgName: string;
  ez: string;
  gst: string;
  adresse: string;
  plz: string;
  ort: string;
  bundesland: string;
}

// Photon API - Free OpenStreetMap geocoder
const PHOTON_API = "https://photon.komoot.io/api";

// Map Austrian state names from German to consistent format
const stateMapping: Record<string, string> = {
  "Wien": "Wien",
  "Niederösterreich": "Niederösterreich",
  "Oberösterreich": "Oberösterreich",
  "Steiermark": "Steiermark",
  "Tirol": "Tirol",
  "Kärnten": "Kärnten",
  "Salzburg": "Salzburg",
  "Vorarlberg": "Vorarlberg",
  "Burgenland": "Burgenland",
};

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate origin to prevent unauthorized access
    if (!isValidOrigin(req)) {
      console.warn("Rejected request from unauthorized origin");
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Rate limiting
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later.", results: [] }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { query } = await req.json();

    if (!query || query.length < 3) {
      return new Response(
        JSON.stringify({ results: [], message: "Query must be at least 3 characters" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`=== Address Search (Photon API) ===`);
    console.log(`Query: ${query}`);
    
    // Photon API: free geocoding service based on OpenStreetMap
    // Filter by Austria (countrycode=AT) and limit results
    const endpoint = `${PHOTON_API}?q=${encodeURIComponent(query)}&limit=20&lang=de&osm_tag=building&osm_tag=place&osm_tag=highway&layer=house&layer=street`;
    
    // First try with Austria bias
    const austriaEndpoint = `${PHOTON_API}?q=${encodeURIComponent(query + " Österreich")}&limit=20&lang=de`;
    
    console.log(`Endpoint: ${austriaEndpoint}`);
    
    const response = await fetch(austriaEndpoint, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Grundbuchauszug-App/1.0",
      },
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      
      return new Response(
        JSON.stringify({ 
          results: [], 
          message: "Adresssuche ist derzeit nicht verfügbar. Bitte nutzen Sie die manuelle Eingabe."
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const data = await response.json();
    console.log(`Photon returned ${data.features?.length || 0} features`);

    // Transform Photon GeoJSON response to our format
    const results: AddressSearchResult[] = [];
    const features = data.features || [];

    for (const feature of features) {
      const props = feature.properties || {};
      
      // Only include Austrian addresses
      if (props.country !== "Österreich" && props.countrycode !== "AT") {
        continue;
      }

      // Build address from components
      const streetName = props.street || props.name || "";
      const houseNumber = props.housenumber || "";
      const fullAddress = [streetName, houseNumber].filter(Boolean).join(" ");
      
      // Skip if no meaningful address
      if (!fullAddress && !props.city && !props.locality) {
        continue;
      }

      const bundesland = props.state || "";
      
      // Only include if it's a valid Austrian state
      if (bundesland && !stateMapping[bundesland]) {
        continue;
      }

      results.push({
        kgNummer: "", // Not available from Photon - user needs to look up
        kgName: "", // Not available from Photon - user needs to look up
        ez: "", // Not available from geocoding
        gst: "", // Not available from geocoding
        adresse: fullAddress || props.name || "",
        plz: props.postcode || "",
        ort: props.city || props.locality || props.town || props.village || props.municipality || "",
        bundesland: bundesland,
      });
    }

    // Remove duplicates based on full address + PLZ + ort
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => 
        r.adresse === result.adresse && 
        r.plz === result.plz && 
        r.ort === result.ort
      )
    );

    console.log(`Transformed ${uniqueResults.length} unique results`);

    return new Response(
      JSON.stringify({ 
        results: uniqueResults,
        totalResults: uniqueResults.length,
        source: "photon" // Indicate source for UI
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in search-address:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        results: [],
        message: "Fehler bei der Suche. Bitte nutzen Sie die manuelle Eingabe."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
