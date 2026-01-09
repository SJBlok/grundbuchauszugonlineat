import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

// Base URL according to spec: https://api.wirtschaftscompass.at/landregister
const API_BASE = "https://api.wirtschaftscompass.at/landregister";

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    let apiKey = Deno.env.get("WIRTSCHAFTSCOMPASS_API_KEY");
    if (!apiKey) {
      throw new Error("WIRTSCHAFTSCOMPASS_API_KEY not configured");
    }
    
    // Auto-format UUID if dashes are missing (32 chars -> 36 chars with dashes)
    if (apiKey.length === 32 && !apiKey.includes("-")) {
      apiKey = `${apiKey.slice(0, 8)}-${apiKey.slice(8, 12)}-${apiKey.slice(12, 16)}-${apiKey.slice(16, 20)}-${apiKey.slice(20)}`;
      console.log("Auto-formatted API key to UUID format");
    }

    console.log(`=== Address Search ===`);
    console.log(`Query: ${query}`);
    console.log(`Token length: ${apiKey.length}`);
    console.log(`Token valid UUID: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(apiKey)}`);
    
    // Address search endpoint: GET /v1/address?term=...&size=...
    const endpoint = `${API_BASE}/v1/address?term=${encodeURIComponent(query)}&size=20`;
    console.log(`Endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
      },
    });
    
    console.log(`Response status: ${response.status}`);
    const responseText = await response.text();
    console.log(`Response body: ${responseText.substring(0, 500)}`);
    
    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      
      return new Response(
        JSON.stringify({ 
          results: [], 
          message: "Adresssuche ist derzeit nicht verfügbar. Bitte nutzen Sie die manuelle Eingabe.",
          debug: {
            status: response.status,
            endpoint: endpoint,
            response: responseText.substring(0, 200)
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse response
    let apiData;
    try {
      apiData = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse JSON response");
      return new Response(
        JSON.stringify({ results: [], message: "Ongeldige API response" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log("Parsed API data:", JSON.stringify(apiData).substring(0, 500));

    // Transform API response according to spec:
    // data.results[].address, data.results[].folios[], data.results[].plots[]
    const results: AddressSearchResult[] = [];
    const resultArray = apiData.data?.results || apiData.results || [];

    if (Array.isArray(resultArray)) {
      for (const item of resultArray) {
        const address = item.address || {};
        const folios = item.folios || [];
        const plots = item.plots || [];
        
        // Build address string
        const streetParts = [address.streetAddress, address.houseNumber].filter(Boolean);
        const fullAddress = streetParts.join(" ") || address.street || "";
        
        const plz = address.postalCode || "";
        const ort = address.place || "";
        const bundesland = address.state || address.federalState || "";
        
        // Create entries for each folio (KG + EZ)
        if (folios.length > 0) {
          for (const folio of folios) {
            results.push({
              kgNummer: String(folio.kg || ""),
              kgName: folio.kgName || "",
              ez: String(folio.ez || ""),
              gst: "",
              adresse: fullAddress,
              plz,
              ort,
              bundesland,
            });
          }
        }
        
        // Handle plots (GST) if no folios
        if (folios.length === 0 && plots.length > 0) {
          for (const plot of plots) {
            results.push({
              kgNummer: String(plot.kg || ""),
              kgName: plot.kgName || "",
              ez: "",
              gst: String(plot.gstNr || ""),
              adresse: fullAddress,
              plz,
              ort,
              bundesland,
            });
          }
        }
      }
    }

    console.log(`Transformed ${results.length} results`);

    return new Response(
      JSON.stringify({ 
        results,
        totalResults: apiData.totalResults || results.length,
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
