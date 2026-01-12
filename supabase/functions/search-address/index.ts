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
