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

    const wirtschaftsCompassApiKey = Deno.env.get("WIRTSCHAFTSCOMPASS_API_KEY");
    if (!wirtschaftsCompassApiKey) {
      throw new Error("WIRTSCHAFTSCOMPASS_API_KEY not configured");
    }

    console.log(`Searching for address: ${query}`);

    // Try both production and test environments
    const baseUrls = [
      "https://api-test.wirtschaftscompass.at/landregister",
      "https://api.wirtschaftscompass.at/landregister",
    ];
    
    const queryPath = `/v1/address?term=${encodeURIComponent(query)}&size=20`;
    
    // Try multiple auth header formats
    type AuthMethod = { name: string; headers: Record<string, string> };
    const authMethods: AuthMethod[] = [
      { name: "compass-api-token", headers: { "compass-api-token": wirtschaftsCompassApiKey, "Accept": "application/json" } },
      { name: "Bearer", headers: { "Authorization": `Bearer ${wirtschaftsCompassApiKey}`, "Accept": "application/json" } },
      { name: "X-API-Key", headers: { "X-API-Key": wirtschaftsCompassApiKey, "Accept": "application/json" } },
    ];
    
    let response: Response | null = null;
    let lastError = "";
    let successUrl = "";
    
    // Try each base URL with each auth method
    urlLoop:
    for (const baseUrl of baseUrls) {
      for (const auth of authMethods) {
        const endpoint = `${baseUrl}${queryPath}`;
        console.log(`Trying: ${endpoint} with ${auth.name}`);
        
        const resp = await fetch(endpoint, {
          method: "GET",
          headers: auth.headers,
        });
        
        console.log(`Response status: ${resp.status}`);
        
        if (resp.ok) {
          response = resp;
          successUrl = endpoint;
          break urlLoop;
        } else {
          lastError = await resp.text();
          console.error(`Failed ${baseUrl} + ${auth.name}: ${lastError.substring(0, 100)}`);
        }
      }
    }
    
    if (!response) {
      console.error("All combinations failed");
      return new Response(
        JSON.stringify({ 
          results: [], 
          message: "Adresssuche ist derzeit nicht verfügbar. Bitte nutzen Sie die manuelle Eingabe.",
          debug: `API authentication failed. Last error: ${lastError.substring(0, 100)}`
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    console.log(`Success with: ${successUrl}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText.substring(0, 500));
      
      return new Response(
        JSON.stringify({ 
          results: [], 
          message: "Adresssuche ist derzeit nicht verfügbar. Bitte nutzen Sie die manuelle Eingabe.",
          debug: `API returned ${response.status}`
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const apiData = await response.json();
    console.log("API response:", JSON.stringify(apiData).substring(0, 1000));

    // Transform API response to our format based on documented structure:
    // results[] with address, folios[] (kg + ez), plots[] (kg + gstNr)
    const results: AddressSearchResult[] = [];
    
    const resultArray = apiData.results || apiData.data?.results || [];

    if (Array.isArray(resultArray)) {
      for (const item of resultArray) {
        // Each result has address info and folios/plots arrays
        const address = item.address || {};
        const folios = item.folios || [];
        const plots = item.plots || [];
        
        // Build full address string
        const fullAddress = [
          address.street,
          address.houseNumber,
        ].filter(Boolean).join(" ");
        
        const plz = address.postalCode || address.postcode || "";
        const ort = address.place || address.city || "";
        const bundesland = address.federalState || address.state || "";
        
        // Create entries for each folio (KG + EZ combination)
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
        
        // Also handle plots (GST) if no folios
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
        
        // Fallback if no folios/plots but still want to show address
        if (folios.length === 0 && plots.length === 0 && fullAddress) {
          results.push({
            kgNummer: item.kg || "",
            kgName: item.kgName || "",
            ez: item.ez || "",
            gst: item.gstNr || "",
            adresse: fullAddress,
            plz,
            ort,
            bundesland,
          });
        }
      }
    }

    console.log(`Found ${results.length} results`);

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
        status: 200, // Return 200 so frontend doesn't break
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
