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

    // Try multiple possible endpoint formats for the Wirtschafts-Compass API
    // Base URL from Swagger: https://api.wirtschaftscompass.at/landregister
    const endpoints = [
      // Using the correct base URL from swagger definition
      `https://api.wirtschaftscompass.at/landregister/v1/address?term=${encodeURIComponent(query)}&size=20`,
      `https://api.wirtschaftscompass.at/landregister/v1/address?query=${encodeURIComponent(query)}&size=20`,
      // Alternative paths
      `https://api.wirtschaftscompass.at/v1/address?term=${encodeURIComponent(query)}&size=20`,
      `https://api.wirtschaftscompass.at/landregister/address?term=${encodeURIComponent(query)}&size=20`,
    ];

    let apiResponse: Response | null = null;
    let successEndpoint = "";

    for (const endpoint of endpoints) {
      console.log(`Trying endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          // Swagger uses security scheme: "compass-api-token"
          "compass-api-token": wirtschaftsCompassApiKey,
          // Keep Authorization as fallback (some deployments still accept Bearer)
          "Authorization": `Bearer ${wirtschaftsCompassApiKey}`,
          "Accept": "application/json",
        },
      });

      console.log(`Response status for ${endpoint}: ${response.status}`);

      if (response.ok) {
        apiResponse = response;
        successEndpoint = endpoint;
        break;
      } else if (response.status !== 404) {
        // Log non-404 errors for debugging
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText.substring(0, 500));
      }
    }

    if (!apiResponse) {
      console.log("No valid endpoint found, returning empty results");
      return new Response(
        JSON.stringify({ 
          results: [], 
          message: "Adresssuche ist derzeit nicht verfügbar. Bitte nutzen Sie die manuelle Eingabe.",
          debug: "No valid API endpoint found"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Success with endpoint: ${successEndpoint}`);
    const data = await apiResponse.json();
    console.log("API response:", JSON.stringify(data).substring(0, 1000));

    // Transform API response to our format
    const results: AddressSearchResult[] = [];
    
    // Try different response structures
    const resultArray = 
      data.data?.results?.addressResult || 
      data.data?.results?.result ||
      data.results?.addressResult ||
      data.results ||
      data.data?.addressResult ||
      [];

    if (Array.isArray(resultArray)) {
      for (const result of resultArray) {
        results.push({
          kgNummer: result.kgNummer || result.kg || result.cadastralNumber || "",
          kgName: result.kgName || result.katastralgemeinde || result.cadastralCommunity || "",
          ez: result.ez || result.einlagezahl || result.depositNumber || "",
          gst: result.gst || result.grundstuecksnummer || result.parcelNumber || "",
          adresse: result.adresse || result.address || `${result.strasse || result.street || ""} ${result.hausnummer || result.houseNumber || ""}`.trim(),
          plz: result.plz || result.postalCode || result.zipCode || "",
          ort: result.ort || result.place || result.city || "",
          bundesland: result.bundesland || result.state || result.federalState || "",
        });
      }
    }

    console.log(`Found ${results.length} results`);

    return new Response(
      JSON.stringify({ 
        results,
        totalResults: data.data?.totalResults || results.length,
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
