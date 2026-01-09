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

    // Call Wirtschafts-Compass API searchAddress endpoint
    const apiResponse = await fetch(
      `https://api.wirtschaftscompass.at/v1/landregister/address/search?query=${encodeURIComponent(query)}&pageSize=20`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${wirtschaftsCompassApiKey}`,
          "Accept": "application/json",
        },
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Wirtschafts-Compass API error:", apiResponse.status, errorText);
      
      // Return empty results instead of error for better UX
      if (apiResponse.status === 404) {
        return new Response(
          JSON.stringify({ results: [], message: "No results found" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      throw new Error(`API request failed: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    console.log("API response:", JSON.stringify(data).substring(0, 500));

    // Transform API response to our format
    // The API response structure may vary - adapting based on typical Compass response format
    const results: AddressSearchResult[] = [];
    
    if (data.data?.results?.addressResult) {
      for (const result of data.data.results.addressResult) {
        results.push({
          kgNummer: result.kgNummer || result.kg || "",
          kgName: result.kgName || result.katastralgemeinde || "",
          ez: result.ez || result.einlagezahl || "",
          gst: result.gst || result.grundstuecksnummer || "",
          adresse: result.adresse || result.address || `${result.strasse || ""} ${result.hausnummer || ""}`.trim(),
          plz: result.plz || result.postalCode || "",
          ort: result.ort || result.place || "",
          bundesland: result.bundesland || result.state || "",
        });
      }
    } else if (data.results) {
      // Alternative response format
      for (const result of data.results) {
        results.push({
          kgNummer: result.kgNummer || result.kg || "",
          kgName: result.kgName || result.katastralgemeinde || "",
          ez: result.ez || result.einlagezahl || "",
          gst: result.gst || result.grundstuecksnummer || "",
          adresse: result.adresse || result.address || "",
          plz: result.plz || "",
          ort: result.ort || "",
          bundesland: result.bundesland || "",
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
      JSON.stringify({ error: error.message, results: [] }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
