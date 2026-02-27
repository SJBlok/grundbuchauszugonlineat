const PROXY_URL = import.meta.env.VITE_UVST_PROXY_URL || "https://uvst-proxy-production.up.railway.app";
const API_KEY = import.meta.env.VITE_UVST_PROXY_API_KEY || "no-key";

async function proxyPost(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(`${PROXY_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-KEY": API_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error?.errorMsg || `Fehler ${res.status}`);
  }
  return data;
}

// ── Helpers ──

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}

// ── Nominatim adres-normalisatie ──

interface NominatimAddress {
  house_number?: string;
  road?: string;
  locality?: string;
  suburb?: string;
  town?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

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
    const query = [strasse, hausnummer, plz, ort, "Austria"]
      .filter(Boolean)
      .join(", ");

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: query,
          format: "json",
          addressdetails: "1",
          limit: "1",
          countrycodes: "at",
        }),
      {
        headers: { "User-Agent": "GrundbuchauszugOnline/1.0" },
      }
    );

    if (!res.ok) return null;

    const results = await res.json();
    if (!results.length) return null;

    const addr: NominatimAddress = results[0].address;
    const hasRoad = !!addr.road;

    return {
      strasse: titleCase(addr.road || addr.locality || strasse),
      hausnummer: addr.house_number || hausnummer || "",
      ort: addr.town || addr.city || ort || "",
      bundesland: addr.state || "",
      isOrtschaft: !hasRoad && !!addr.locality,
    };
  } catch (err) {
    console.warn("Nominatim lookup failed, using original data:", err);
    return null;
  }
}

// ── UVST functies ──

export async function validateEinlage(katastralgemeinde: string, einlagezahl: string) {
  return proxyPost("/api/einlage-validate", { katastralgemeinde, einlagezahl });
}

export async function searchAddress(params: {
  bundesland?: string;
  ort?: string;
  plz?: string;
  strasse: string;
  hausnummer?: string;
}) {
  // Stap 1: Normaliseer via Nominatim
  const normalized = await normalizeWithNominatim(
    params.strasse,
    params.hausnummer,
    params.plz,
    params.ort
  );

  if (normalized) {
    console.log("Nominatim result:", normalized);

    if (normalized.isOrtschaft) {
      console.log("Ortschaft detected, using erweiterte Suche (GT_ADR02)");
      return proxyPost("/api/address-search", {
        strasse: normalized.strasse,
        hausnummer: normalized.hausnummer || undefined,
        ort: normalized.strasse,
        bundesland: normalized.bundesland || params.bundesland || undefined,
        sucheErweitert: true,
      });
    } else {
      console.log("Street address detected, using standard search (GT_ADR)");
      return proxyPost("/api/address-search", {
        strasse: normalized.strasse,
        hausnummer: normalized.hausnummer || undefined,
        ort: normalized.ort || params.ort || undefined,
        bundesland: normalized.bundesland || params.bundesland || undefined,
      });
    }
  }

  // Fallback: Nominatim niet beschikbaar
  console.warn("Nominatim unavailable, falling back to direct UVST search");
  return proxyPost("/api/address-search", {
    strasse: titleCase(params.strasse),
    hausnummer: params.hausnummer || undefined,
    ort: params.ort || undefined,
    bundesland: params.bundesland || undefined,
  });
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
