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

    let wirtschaftsCompassApiKey = Deno.env.get("WIRTSCHAFTSCOMPASS_API_KEY");
    if (!wirtschaftsCompassApiKey) {
      throw new Error("WIRTSCHAFTSCOMPASS_API_KEY not configured");
    }
    
    // Auto-format UUID if dashes are missing (32 chars -> 36 chars with dashes)
    if (wirtschaftsCompassApiKey.length === 32 && !wirtschaftsCompassApiKey.includes("-")) {
      wirtschaftsCompassApiKey = `${wirtschaftsCompassApiKey.slice(0, 8)}-${wirtschaftsCompassApiKey.slice(8, 12)}-${wirtschaftsCompassApiKey.slice(12, 16)}-${wirtschaftsCompassApiKey.slice(16, 20)}-${wirtschaftsCompassApiKey.slice(20)}`;
      console.log("Auto-formatted API key to UUID format");
    }

    console.log(`Searching for: ${query}`);
    console.log(`Token length: ${wirtschaftsCompassApiKey.length}`);
    console.log(`Token format valid: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(wirtschaftsCompassApiKey)}`);
    
    // Test with a documented endpoint: /v1/{kg}/{ez} (Grundbuchauszug)
    // Using a known test KG/EZ from Vienna: KG 01004 (Innere Stadt), EZ 1
    const testKg = "01004";
    const testEz = "1";
    const testEndpoint = `https://api.wirtschaftscompass.at/landregister/v1/${testKg}/${testEz}`;
    
    console.log(`Testing documented endpoint: ${testEndpoint}`);
    
    const authHeader = `Bearer ${wirtschaftsCompassApiKey}`;
    
    // First test with documented endpoint to verify token works
    const testResponse = await fetch(testEndpoint, {
      method: "GET",
      headers: {
        "Authorization": authHeader,
        "Accept": "application/json",
      },
    });
    
    console.log(`Test endpoint response: ${testResponse.status}`);
    
    if (testResponse.status === 401) {
      console.error("Token is not valid - 401 on documented endpoint");
      return new Response(
        JSON.stringify({ 
          results: [], 
          message: "API-Authentifizierung fehlgeschlagen. Token ist ungültig.",
          debug: `Test endpoint returned 401`
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    if (testResponse.ok) {
      console.log("Token works! Documented endpoint returned 200");
      const testData = await testResponse.text();
      console.log(`Test data: ${testData.substring(0, 500)}`);
    } else {
      const testError = await testResponse.text();
      console.log(`Test endpoint error (${testResponse.status}): ${testError.substring(0, 200)}`);
    }

    // Now try the address endpoint
    const endpoint = `https://api.wirtschaftscompass.at/landregister/v1/address?term=${encodeURIComponent(query)}&size=20`;
    console.log(`Calling address endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Authorization": authHeader,
        "Accept": "application/json",
      },
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      
      return new Response(
        JSON.stringify({ 
          results: [], 
          message: "Adresssuche ist derzeit nicht verfügbar. Bitte nutzen Sie die manuelle Eingabe.",
          debug: `API returned ${response.status}: ${errorText.substring(0, 100)}`
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

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
