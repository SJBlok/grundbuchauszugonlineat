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

export async function validateEinlage(katastralgemeinde: string, einlagezahl: string) {
  return proxyPost("/api/einlage-validate", { katastralgemeinde, einlagezahl });
}

/**
 * Splits "spiegelgasse 7" → { strasse: "Spiegelgasse", hausnummer: "7" }
 * Handles formats like: "Hauptstraße 12", "Am Graben 3a", "spiegelgasse 7/2/4"
 */
function splitAddress(adresse: string): { strasse: string; hausnummer: string } {
  const trimmed = adresse.trim();
  const match = trimmed.match(/^(.+?)\s+(\d+\S*)$/);
  if (match) {
    return { strasse: titleCase(match[1]), hausnummer: match[2] };
  }
  return { strasse: titleCase(trimmed), hausnummer: "" };
}

/**
 * Capitalizes first letter of each word for UVST case-sensitive matching.
 * "spiegelgasse" → "Spiegelgasse", "am graben" → "Am Graben"
 */
function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}

export async function searchAddress(params: {
  bundesland?: string;
  ort?: string;
  strasse: string;
}) {
  const { strasse, hausnummer } = splitAddress(params.strasse);
  return proxyPost("/api/address-search", {
    bundesland: params.bundesland,
    ort: params.ort,
    strasse,
    hausnummer: hausnummer || undefined,
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
  return ergebnisse.map(er => {
    const el = er as Element;
    const get = (tag: string) => el.getElementsByTagNameNS("*", tag)[0]?.textContent?.trim() || "";
    const adresse = el.closest("Adresse") || el.parentElement?.closest("Adresse");
    const getParent = (tag: string) => adresse?.getElementsByTagName(tag)[0]?.textContent?.trim() || "";
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
