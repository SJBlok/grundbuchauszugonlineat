/**
 * Parse Austrian house number format into separate components.
 *
 * Formats:
 *   "9"            → { hausnummer: "9" }
 *   "9/2/11"       → { hausnummer: "9", stiege: "2", tuer: "11" }
 *   "9/Top 5"      → { hausnummer: "9", tuer: "5" }
 *   "9/Stiege 2"   → { hausnummer: "9", stiege: "2" }
 *   "9/Stiege 2/Top 11" → { hausnummer: "9", stiege: "2", tuer: "11" }
 *   "12a/3"        → { hausnummer: "12a", tuer: "3" }
 *   "12a/3/7"      → { hausnummer: "12a", stiege: "3", tuer: "7" }
 */
export interface ParsedHausnummer {
  hausnummer: string;
  stiege: string | null;
  tuer: string | null;
}

export function parseHausnummer(raw: string): ParsedHausnummer {
  if (!raw || !raw.trim()) {
    return { hausnummer: "", stiege: null, tuer: null };
  }

  const input = raw.trim();

  // Check for named parts: "Stiege X", "Top X", "Tür X"
  const namedPattern = /^([^/]+?)(?:\/(?:Stiege|St\.?|Stg\.?)\s*(\w+))?(?:\/(?:Top|Tür|T\.?)\s*(\w+))?$/i;
  const namedMatch = input.match(namedPattern);

  if (namedMatch && (namedMatch[2] || namedMatch[3])) {
    return {
      hausnummer: namedMatch[1].trim(),
      stiege: namedMatch[2]?.trim() || null,
      tuer: namedMatch[3]?.trim() || null,
    };
  }

  // Numeric format: "9/2/11" or "9/2" or "9"
  const parts = input.split("/").map((p) => p.trim()).filter(Boolean);

  if (parts.length === 1) {
    return { hausnummer: parts[0], stiege: null, tuer: null };
  }

  if (parts.length === 2) {
    // 2 parts: hausnummer/tür (most common in Austria)
    return { hausnummer: parts[0], stiege: null, tuer: parts[1] };
  }

  if (parts.length >= 3) {
    // 3+ parts: hausnummer/stiege/tür
    return { hausnummer: parts[0], stiege: parts[1], tuer: parts[2] };
  }

  return { hausnummer: input, stiege: null, tuer: null };
}
