const PROXY_URL = import.meta.env.VITE_UVST_PROXY_URL || "";
const API_KEY = import.meta.env.VITE_UVST_PROXY_API_KEY || "";

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

export async function searchAddress(params: {
  bundesland?: string;
  ort?: string;
  strasse: string;
}) {
  return proxyPost("/api/address-search", params);
}

export async function fetchAktuell(katastralgemeinde: string, einlagezahl: string) {
  return proxyPost("/api/property-extract", {
    katastralgemeinde,
    einlagezahl,
    historisch: false,
  });
}

export async function fetchHistorisch(katastralgemeinde: string, einlagezahl: string) {
  return proxyPost("/api/property-extract", {
    katastralgemeinde,
    einlagezahl,
    historisch: true,
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
