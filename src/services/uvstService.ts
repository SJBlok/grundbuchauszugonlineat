import { supabase } from "@/integrations/supabase/client";

const PROXY_URL = import.meta.env.VITE_UVST_PROXY_URL || "https://uvst-proxy-production.up.railway.app";
const API_KEY = import.meta.env.VITE_UVST_PROXY_API_KEY || "no-key";

async function proxyPost(endpoint: string, body: Record<string, unknown>, timeoutMs = 90000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${PROXY_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": API_KEY },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error?.errorMsg || `Fehler ${res.status}`);
    }
    return data;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Zeitüberschreitung — der UVST-Server antwortet nicht. Bitte erneut versuchen.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ── Helpers ──

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}

// ── Nominatim adres-normalisatie ──

interface NormalizedAddress {
  strasse: string;
  hausnummer: string;
  ort: string;
  bundesland: string;
  isOrtschaft: boolean;
}

async function normalizeWithNominatim(
  strasse: string,
  hausnummer?: string,
  plz?: string,
  ort?: string
): Promise<NormalizedAddress | null> {
  try {
    const { data, error } = await supabase.functions.invoke("nominatim-lookup", {
      body: { strasse, hausnummer, plz, ort },
    });

    if (error || !data?.result) {
      console.warn("Nominatim lookup returned no result:", error);
      return null;
    }

    console.log("Nominatim result:", data.result);
    return data.result as NormalizedAddress;
  } catch (err) {
    console.warn("Nominatim lookup failed, using original data:", err);
    return null;
  }
}

// ── UVST functies ──

export async function validateEinlage(katastralgemeinde: string, einlagezahl: string) {
  return proxyPost("/api/einlage-validate", { katastralgemeinde, einlagezahl });
}

function sanitizeHausnummer(hausnummer: string): string {
  if (!hausnummer) return "";
  return hausnummer.split("/")[0].trim();
}

export async function searchAddress(params: {
  bundesland?: string;
  ort?: string;
  plz?: string;
  strasse: string;
  hausnummer?: string;
}) {
  // Stap 1: Normaliseer via Nominatim
  // Sanitize hausnummer VOOR Nominatim call
  const cleanHausnummer = params.hausnummer ? sanitizeHausnummer(params.hausnummer) : undefined;

  const normalized = await normalizeWithNominatim(
    params.strasse,
    cleanHausnummer,
    params.plz,
    params.ort
  );

  let uvstResult;
  let searchParams: Record<string, unknown> = {};

  if (normalized) {
    console.log("Nominatim result:", normalized);

    if (normalized.isOrtschaft) {
      console.log("Ortschaft detected, using erweiterte Suche (GT_ADR02)");
      searchParams = {
        strasse: normalized.strasse,
        hausnummer: normalized.hausnummer || undefined,
        plz: params.plz || undefined,
        ort: normalized.strasse,
        bundesland: normalized.bundesland || params.bundesland || undefined,
        sucheErweitert: true,
      };
    } else {
      console.log("Street address detected, using standard search (GT_ADR)");
      searchParams = {
        strasse: normalized.strasse,
        hausnummer: normalized.hausnummer || undefined,
        plz: params.plz || undefined,
        ort: normalized.ort || params.ort || undefined,
        bundesland: normalized.bundesland || params.bundesland || undefined,
        sucheErweitert: false,
      };
    }
    uvstResult = await proxyPost("/api/address-search", searchParams);
  } else {
    // Fallback: Nominatim niet beschikbaar
    console.warn("Nominatim unavailable, falling back to direct UVST search");
    const fallbackHausnummer = params.hausnummer ? sanitizeHausnummer(params.hausnummer) : undefined;
    searchParams = {
      strasse: titleCase(params.strasse),
      hausnummer: fallbackHausnummer || undefined,
      plz: params.plz || undefined,
      ort: params.ort || undefined,
      bundesland: params.bundesland || undefined,
      sucheErweitert: false,
    };
    uvstResult = await proxyPost("/api/address-search", searchParams);
  }

  // Extract ProduktID uit de XML response
  let produktId = "onbekend";
  const produktMatch = uvstResult.data?.responseDecoded?.match(/<ProduktID>([^<]+)<\/ProduktID>/);
  if (produktMatch) produktId = produktMatch[1];

  // Voeg debug info toe
  uvstResult._debug = {
    nominatim: normalized || null,
    searchParams,
    uvstProduct: {
      produktId,
      gebuehr: uvstResult.data?.ergebnis?.kosten?.gebuehr ?? 0,
      aufschlag: uvstResult.data?.ergebnis?.kosten?.aufschlag ?? 0,
      gesamtKosten: uvstResult.data?.ergebnis?.kosten?.gesamtKostenInklUst ?? 0,
    },
  };

  return uvstResult;
}

export async function fetchAktuell(katastralgemeinde: string, einlagezahl: string, signiert = false) {
  return proxyPost("/api/property-extract", {
    katastralgemeinde,
    einlagezahl,
    historisch: false,
    signiert,
  });
}

export async function fetchHistorisch(katastralgemeinde: string, einlagezahl: string, signiert = false) {
  return proxyPost("/api/property-extract", {
    katastralgemeinde,
    einlagezahl,
    historisch: true,
    signiert,
  });
}

export function parseAddressResults(xmlString: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  const ergebnisse = Array.from(doc.getElementsByTagNameNS("*", "Ergebnis"));
  return ergebnisse.map((er) => {
    const el = er as Element;
    const get = (tag: string) =>
      el.getElementsByTagNameNS("*", tag)[0]?.textContent?.trim() || "";
    const adresse =
      el.closest("Adresse") || el.parentElement?.closest("Adresse");
    const getParent = (tag: string) =>
      adresse?.getElementsByTagName(tag)[0]?.textContent?.trim() || "";
    return {
      kgNummer: get("Katastralgemeindenummer"),
      kgName: get("Katastralgemeindebezeichnung"),
      einlagezahl: get("Einlagezahl"),
      grundstuecksnummer: get("Stammnummer"),
      strasse: getParent("Strasse"),
      hausnummer: getParent("Hausnummer"),
      ort: getParent("Ortsbezeichnung"),
    };
  });
}
