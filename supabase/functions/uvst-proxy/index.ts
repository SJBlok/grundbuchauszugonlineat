import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Md5 } from "https://deno.land/std@0.119.0/hash/md5.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UVST_URLS = {
  test: 'https://sws-test.uvst.at',
  prod: 'https://sws.uvst.at',
};

// MD5 hash function using Deno std library
function md5(message: string): string {
  return new Md5().update(message).toString();
}

// Build XML request for different product types
// Note: Using the namespace from UVST GB WebService documentation
function buildXmlRequest(produkt: string, data: Record<string, unknown>): string {
  const ns = 'http://www.justiz.gv.at/namespace/gb/sws/1';
  
  switch (produkt) {
    case 'GT_ADR': // Adresssuche
      return `<?xml version="1.0" encoding="UTF-8"?>
<AdresssucheAnfrage xmlns="${ns}">
  <Strasse>${escapeXml(data.strasse as string || '')}</Strasse>
  <Hausnummer>${escapeXml(data.hausnummer as string || '')}</Hausnummer>
  <PLZ>${escapeXml(data.plz as string || '')}</PLZ>
  <Ort>${escapeXml(data.ort as string || '')}</Ort>
</AdresssucheAnfrage>`;

    case 'GT_GBA': // Grundbuchauszug aktuell
      return `<?xml version="1.0" encoding="UTF-8"?>
<GBAuszugAnfrage xmlns="${ns}">
  <KGNummer>${escapeXml(data.kgNummer as string || '')}</KGNummer>
  <Einlagezahl>${escapeXml(data.einlagezahl as string || '')}</Einlagezahl>
  <Signiert>${data.signiert ? 'true' : 'false'}</Signiert>
</GBAuszugAnfrage>`;

    case 'GT_GBP': // Grundbuchauszug historisch
      return `<?xml version="1.0" encoding="UTF-8"?>
<HistorischerAuszugAnfrage xmlns="${ns}">
  <KGNummer>${escapeXml(data.kgNummer as string || '')}</KGNummer>
  <Einlagezahl>${escapeXml(data.einlagezahl as string || '')}</Einlagezahl>
  <Signiert>${data.signiert ? 'true' : 'false'}</Signiert>
</HistorischerAuszugAnfrage>`;

    case 'GT_URL': // Urkundenliste
      return `<?xml version="1.0" encoding="UTF-8"?>
<UrkundenlisteAnfrage xmlns="${ns}">
  <KGNummer>${escapeXml(data.kgNummer as string || '')}</KGNummer>
  <Einlagezahl>${escapeXml(data.einlagezahl as string || '')}</Einlagezahl>
</UrkundenlisteAnfrage>`;

    case 'GT_URK': // Urkundenabfrage
      return `<?xml version="1.0" encoding="UTF-8"?>
<UrkundenabfrageAnfrage xmlns="${ns}">
  <KGNummer>${escapeXml(data.kgNummer as string || '')}</KGNummer>
  <Einlagezahl>${escapeXml(data.einlagezahl as string || '')}</Einlagezahl>
  <UrkundenNummer>${escapeXml(data.urkundenNummer as string || '')}</UrkundenNummer>
  <Jahr>${escapeXml(data.jahr as string || '')}</Jahr>
</UrkundenabfrageAnfrage>`;

    case 'GT_EZV': // Einlage-Validierung
      return `<?xml version="1.0" encoding="UTF-8"?>
<EinlageValidierungAnfrage xmlns="${ns}">
  <KGNummer>${escapeXml(data.kgNummer as string || '')}</KGNummer>
  <Einlagezahl>${escapeXml(data.einlagezahl as string || '')}</Einlagezahl>
</EinlageValidierungAnfrage>`;

    default:
      throw new Error(`Unknown product: ${produkt}`);
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Base64 encode XML for UVST API
function encodeXmlToBase64(xml: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(xml);
  return btoa(String.fromCharCode(...data));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, environment, data } = await req.json();
    const baseUrl = environment === 'prod' ? UVST_URLS.prod : UVST_URLS.test;
    
    // Get credentials from secrets
    const username = Deno.env.get('UVST_USERNAME');
    const password = Deno.env.get('UVST_PASSWORD');
    const apiKey = Deno.env.get('UVST_API_KEY');

    if (!username || !password || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'UVST credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let response;
    const startTime = Date.now();

    switch (action) {
      case 'authenticate': {
        const passwordHash = md5(password);
        
        response = await fetch(`${baseUrl}/api/v1/authenticate`, {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password: passwordHash,
          }),
        });
        break;
      }

      case 'gbRequest': {
        // New unified GB request handler
        if (!data.token) {
          return new Response(
            JSON.stringify({ error: 'Token is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const produkt = data.produkt as string;
        const xmlRequest = buildXmlRequest(produkt, data);
        const xmlBase64 = encodeXmlToBase64(xmlRequest);

        const requestBody = {
          includeResult: true,
          produkt,
          uvstInfo: {
            betriebssystem: 'Linux',
            geraeteName: 'WebServer',
            softwareName: 'GrundbuchauszugOnline.at',
            softwareVersion: '1.0.0',
            usewareKosten: 0.0,
            usewareProdukt: 'GBAONL',
            weitereInfo: '',
          },
          xml: xmlBase64,
        };

        console.log('UVST GB Request:', JSON.stringify(requestBody, null, 2));

        response = await fetch(`${baseUrl}/api/v1/gb`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        break;
      }

      // Legacy endpoints (kept for backward compatibility)
      case 'grundbuchAbfrage': {
        if (!data.token) {
          return new Response(
            JSON.stringify({ error: 'Token is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Support both GT_GBA and GT_GBP
        const produkt = (data.produkt as string) || 'GT_GBA';
        const xmlRequest = buildXmlRequest(produkt, data);
        const xmlBase64 = encodeXmlToBase64(xmlRequest);
        const requestBody = {
          includeResult: true,
          produkt,
          uvstInfo: {
            betriebssystem: 'Linux',
            geraeteName: 'WebServer',
            softwareName: 'GrundbuchauszugOnline.at',
            softwareVersion: '1.0.0',
            usewareKosten: 0.0,
            usewareProdukt: 'GBAONL',
            weitereInfo: '',
          },
          xml: xmlBase64,
        };

        console.log('UVST Grundbuch Abfrage Request:', JSON.stringify(requestBody, null, 2));

        response = await fetch(`${baseUrl}/api/v1/gb`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        break;
      }

      case 'grundbuchUrkunden': {
        if (!data.token) {
          return new Response(
            JSON.stringify({ error: 'Token is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const xmlRequest = buildXmlRequest('GT_URK', data);
        const xmlBase64 = encodeXmlToBase64(xmlRequest);
        const requestBody = {
          includeResult: true,
          produkt: 'GT_URK',
          uvstInfo: {
            betriebssystem: 'Linux',
            geraeteName: 'WebServer',
            softwareName: 'GrundbuchauszugOnline.at',
            softwareVersion: '1.0.0',
            usewareKosten: 0.0,
            usewareProdukt: 'GBAONL',
            weitereInfo: '',
          },
          xml: xmlBase64,
        };

        response = await fetch(`${baseUrl}/api/v1/gb`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        break;
      }

      case 'adresssuche': {
        if (!data.token) {
          return new Response(
            JSON.stringify({ error: 'Token is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const xmlRequest = buildXmlRequest('GT_ADR', data);
        const xmlBase64 = encodeXmlToBase64(xmlRequest);
        const requestBody = {
          includeResult: true,
          produkt: 'GT_ADR',
          uvstInfo: {
            betriebssystem: 'Linux',
            geraeteName: 'WebServer',
            softwareName: 'GrundbuchauszugOnline.at',
            softwareVersion: '1.0.0',
            usewareKosten: 0.0,
            usewareProdukt: 'GBAONL',
            weitereInfo: '',
          },
          xml: xmlBase64,
        };

        // Detailed logging for debugging
        console.log('========== UVST ADRESSSUCHE DEBUG ==========');
        console.log('Environment:', environment);
        console.log('Endpoint:', `${baseUrl}/api/v1/gb`);
        console.log('');
        console.log('--- RAW XML (before Base64) ---');
        console.log(xmlRequest);
        console.log('');
        console.log('--- FULL REQUEST BODY ---');
        console.log(JSON.stringify(requestBody, null, 2));
        console.log('');
        console.log('--- REQUEST HEADERS ---');
        console.log('Authorization: Bearer', data.token.substring(0, 20) + '...');
        console.log('X-API-KEY:', apiKey?.substring(0, 10) + '...');
        console.log('Content-Type: application/json');
        console.log('=============================================');

        response = await fetch(`${baseUrl}/api/v1/gb`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        // Log raw response
        const rawResponseText = await response.text();
        console.log('');
        console.log('========== UVST RESPONSE ==========');
        console.log('Status:', response.status, response.statusText);
        console.log('');
        console.log('--- RAW RESPONSE BODY ---');
        console.log(rawResponseText);
        console.log('');
        
        // Try to parse and decode if it contains base64 result
        try {
          const parsed = JSON.parse(rawResponseText);
          if (parsed.result) {
            console.log('--- DECODED RESULT (Base64 -> XML) ---');
            try {
              const decoded = atob(parsed.result);
              console.log(decoded);
            } catch (e) {
              console.log('Could not decode result as Base64');
            }
          }
        } catch (e) {
          console.log('Response is not JSON');
        }
        console.log('====================================');
        
        // Return early with the response we already consumed
        const duration = Date.now() - startTime;
        let responseData;
        try {
          responseData = JSON.parse(rawResponseText);
        } catch {
          responseData = { rawResponse: rawResponseText };
        }
        
        return new Response(
          JSON.stringify({
            success: response.ok,
            status: response.status,
            data: responseData,
            duration,
            debug: {
              xmlSent: xmlRequest,
              endpoint: `${baseUrl}/api/v1/gb`,
            }
          }),
          { 
            status: response.ok ? 200 : response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const duration = Date.now() - startTime;
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // Response might be XML or other format
      responseData = { rawResponse: responseText };
    }

    console.log('UVST Response:', response.status, responseText.substring(0, 500));

    return new Response(
      JSON.stringify({
        success: response.ok,
        status: response.status,
        data: responseData,
        duration,
      }),
      { 
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('UVST Proxy Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
