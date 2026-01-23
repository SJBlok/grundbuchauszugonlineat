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

      case 'grundbuchAbfrage': {
        if (!data.token) {
          return new Response(
            JSON.stringify({ error: 'Token is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        response = await fetch(`${baseUrl}/api/v1/gb/abfrage`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kgNummer: data.kgNummer,
            einlagezahl: data.einlagezahl,
            auszugTyp: {
              englischeFassung: false,
              format: data.format || 'PDF',
              aktuellerAuszug: {
                historisch: data.historisch ?? true,
                signiert: data.signiert ?? true,
                linked: data.linked ?? false,
              },
            },
            ...(data.stichtag && { stichtag: data.stichtag }),
            includeResult: true,
            uvstInfo: {
              betriebssystem: 'Linux',
              softwareName: 'GrundbuchauszugOnline.at',
              softwareVersion: '1.0.0',
              usewareKosten: 0,
              usewareProdukt: 'GRUNDBUCH_ONLINE',
            },
          }),
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

        response = await fetch(`${baseUrl}/api/v1/gb/urkunden`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kgNummer: data.kgNummer,
            einlagezahl: data.einlagezahl,
            urkundenNummer: data.urkundenNummer,
            jahr: data.jahr,
            includeResult: true,
            uvstInfo: {
              betriebssystem: 'Linux',
              softwareName: 'GrundbuchauszugOnline.at',
              softwareVersion: '1.0.0',
              usewareKosten: 0,
              usewareProdukt: 'GRUNDBUCH_ONLINE',
            },
          }),
        });
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const duration = Date.now() - startTime;
    const responseData = await response.json();

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
