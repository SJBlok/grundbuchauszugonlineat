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

// 1) Einlage validieren (GT_EZV) — €0,41
export async function validateEinlage(katastralgemeinde: string, einlagezahl: string) {
  return proxyPost("/api/einlage-validate", { katastralgemeinde, einlagezahl });
}

// 2) Adresssuche (GT_ADR) — ~€0,04
export async function searchAddress(params: {
  bundesland?: string;
  ort?: string;
  strasse: string;
  hausnummer?: string;
}) {
  return proxyPost("/api/address-search", params);
}

// 3) Grundbuchauszug aktuell (GT_GBA) — ~€5,04
export async function fetchAktuell(katastralgemeinde: string, einlagezahl: string) {
  return proxyPost("/api/property-extract", {
    katastralgemeinde,
    einlagezahl,
    historisch: false,
  });
}

// 4) Grundbuchauszug historisch (GT_GBP) — ~€2,72
export async function fetchHistorisch(katastralgemeinde: string, einlagezahl: string) {
  return proxyPost("/api/property-extract", {
    katastralgemeinde,
    einlagezahl,
    historisch: true,
  });
}

// Parse GT_GBA XML response
export function parseGBAuszug(xmlString: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  const get = (tag: string) => doc.getElementsByTagNameNS("*", tag)[0]?.textContent?.trim() || "";
  const getAll = (tag: string) => Array.from(doc.getElementsByTagNameNS("*", tag));

  return {
    kgNummer: get("Katastralgemeindenummer"),
    kgName: get("Katastralgemeindebezeichnung"),
    einlagezahl: get("Einlagezahl"),
    grundstuecke: getAll("Grundstueck").map(gs => ({
      nummer: (gs as Element).getElementsByTagNameNS("*", "Stammnummer")[0]?.textContent?.trim() || "",
      flaeche: (gs as Element).getElementsByTagNameNS("*", "Flaeche")[0]?.textContent?.trim() || "",
      nutzung: (gs as Element).getElementsByTagNameNS("*", "Nutzungsart")[0]?.textContent?.trim() || "",
      strasse: (gs as Element).getElementsByTagNameNS("*", "Strasse")[0]?.textContent?.trim() || "",
      hausnummer: (gs as Element).getElementsByTagNameNS("*", "Hausnummer")[0]?.textContent?.trim() || "",
    })),
    gesamtflaeche: get("Gesamtflaeche"),
    eigentuemer: getAll("Eigentuemer").map(et => ({
      name: (et as Element).getElementsByTagNameNS("*", "Bezeichnung")[0]?.textContent?.trim() ||
            [(et as Element).getElementsByTagNameNS("*", "Vorname")[0]?.textContent?.trim(),
             (et as Element).getElementsByTagNameNS("*", "Nachname")[0]?.textContent?.trim()].filter(Boolean).join(" "),
      anteil: `${(et as Element).getElementsByTagNameNS("*", "AnteilZaehler")[0]?.textContent?.trim() || ""}/${(et as Element).getElementsByTagNameNS("*", "AnteilNenner")[0]?.textContent?.trim() || ""}`,
    })),
    lasten: getAll("Belastung").map(b => ({
      text: (b as Element).getElementsByTagNameNS("*", "Text")[0]?.textContent?.trim() || "",
      tz: (b as Element).getElementsByTagNameNS("*", "Tagebuchzahltext")[0]?.textContent?.trim() || "",
    })),
    produktId: get("ProduktID"),
    preis: get("Preis"),
  };
}

// Parse GT_ADR address search results
export function parseAddressResults(xmlString: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  const treffer = Array.from(doc.getElementsByTagNameNS("*", "Treffer"));
  return treffer.map(t => {
    const el = t as Element;
    const get = (tag: string) => el.getElementsByTagNameNS("*", tag)[0]?.textContent?.trim() || "";
    return {
      kgNummer: get("Katastralgemeindenummer"),
      kgName: get("Katastralgemeindebezeichnung"),
      einlagezahl: get("Einlagezahl"),
      grundstuecksnummer: get("Stammnummer"),
      strasse: get("Strasse"),
      hausnummer: get("Hausnummer"),
      ort: get("Ortsbezeichnung"),
    };
  });
}
