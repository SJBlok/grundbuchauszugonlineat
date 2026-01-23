// UVST Grundbuch API Types

export interface UVSTCredentials {
  username: string;
  password: string;
  apiKey: string;
}

export interface UVSTToken {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface TokenState {
  value: string | null;
  expiresAt: number | null;
  type: string | null;
}

export interface AddressData {
  straat: string;
  huisnummer: string;
  postcode: string;
  plaats: string;
}

export interface LookupResult {
  kgNummer: string;
  kgName: string;
  einlagezahl: string;
  gericht: string;
}

export interface AbfrageConfig {
  historisch: boolean;
  signiert: boolean;
  linked: boolean;
  format: 'XML' | 'PDF' | 'HTML';
  stichtag?: string;
}

export interface AbfrageKosten {
  gebuehr: number;
  entgelt: number;
  aufschlag: number;
  usewareKosten: number;
  ust: number;
  gesamtKostenInklUst: number;
  gesamtKostenExklUst: number;
}

export interface AbfrageErgebnis {
  transactionId: string;
  kosten: AbfrageKosten;
  timestamp: number;
  aktuell: boolean;
  infoText?: string;
}

export interface AbfrageResponse {
  ergebnis: AbfrageErgebnis;
  response: string; // Base64 encoded document
  resourceId: string;
  resourceContentTyp: string;
  resourceSize: number;
}

export interface UrkundenRequest {
  urkundenNummer: string;
  jahr: string;
}

export interface APILogEntry {
  id: string;
  timestamp: Date;
  method: 'POST' | 'GET';
  endpoint: string;
  requestHeaders: Record<string, string>;
  requestBody: unknown;
  responseStatus: number;
  responseBody: unknown;
  duration: number;
}

export type Environment = 'test' | 'prod';
export type WizardStep = 1 | 2 | 3 | 4;
