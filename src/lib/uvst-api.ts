import { supabase } from '@/integrations/supabase/client';
import type {
  Environment,
  TokenState,
  AbfrageConfig,
  AbfrageResponse,
  APILogEntry,
} from '@/types/grundbuch-api';

interface ProxyResponse<T = unknown> {
  success: boolean;
  status: number;
  data: T;
  duration: number;
}

interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

// Create API log entry
const createLogEntry = (
  method: 'POST' | 'GET',
  endpoint: string,
  requestBody: unknown,
  status: number,
  responseBody: unknown,
  duration: number
): APILogEntry => ({
  id: crypto.randomUUID(),
  timestamp: new Date(),
  method,
  endpoint,
  requestHeaders: { 'Content-Type': 'application/json' },
  requestBody,
  responseStatus: status,
  responseBody,
  duration,
});

export async function authenticate(
  environment: Environment,
  onLog?: (log: APILogEntry) => void
): Promise<TokenState> {
  const startTime = Date.now();
  
  const { data, error } = await supabase.functions.invoke<ProxyResponse<AuthResponse>>('uvst-proxy', {
    body: {
      action: 'authenticate',
      environment,
    },
  });

  const duration = Date.now() - startTime;

  if (onLog) {
    onLog(createLogEntry(
      'POST',
      `/api/v1/authenticate`,
      { environment },
      data?.status ?? 500,
      data?.data ?? { error: error?.message },
      duration
    ));
  }

  if (error || !data?.success) {
    throw new Error(error?.message || 'Authentication failed');
  }

  const authData = data.data;
  return {
    value: authData.accessToken,
    expiresAt: Date.now() + (authData.expiresIn * 1000),
    type: authData.tokenType,
  };
}

export async function grundbuchAbfrage(
  environment: Environment,
  token: string,
  kgNummer: string,
  einlagezahl: string,
  config: AbfrageConfig,
  onLog?: (log: APILogEntry) => void
): Promise<AbfrageResponse> {
  const startTime = Date.now();

  const requestData = {
    action: 'grundbuchAbfrage',
    environment,
    data: {
      token,
      kgNummer,
      einlagezahl,
      format: config.format,
      historisch: config.historisch,
      signiert: config.signiert,
      linked: config.linked,
      ...(config.stichtag && { stichtag: config.stichtag }),
    },
  };

  const { data, error } = await supabase.functions.invoke<ProxyResponse<AbfrageResponse>>('uvst-proxy', {
    body: requestData,
  });

  const duration = Date.now() - startTime;

  if (onLog) {
    onLog(createLogEntry(
      'POST',
      `/api/v1/gb (GT_GBA)`,
      {
        produkt: 'GT_GBA',
        xml: `<GBAuszugAnfrage>...</GBAuszugAnfrage>`,
        ...requestData.data,
      },
      data?.status ?? 500,
      data?.data ?? { error: error?.message },
      duration
    ));
  }

  if (error || !data?.success) {
    throw new Error(error?.message || 'Grundbuch query failed');
  }

  return data.data;
}

export async function grundbuchUrkunden(
  environment: Environment,
  token: string,
  kgNummer: string,
  einlagezahl: string,
  urkundenNummer: string,
  jahr: string,
  onLog?: (log: APILogEntry) => void
): Promise<AbfrageResponse> {
  const startTime = Date.now();

  const requestData = {
    action: 'grundbuchUrkunden',
    environment,
    data: {
      token,
      kgNummer,
      einlagezahl,
      urkundenNummer,
      jahr,
    },
  };

  const { data, error } = await supabase.functions.invoke<ProxyResponse<AbfrageResponse>>('uvst-proxy', {
    body: requestData,
  });

  const duration = Date.now() - startTime;

  if (onLog) {
    onLog(createLogEntry(
      'POST',
      `/api/v1/gb/urkunden`,
      requestData.data,
      data?.status ?? 500,
      data?.data ?? { error: error?.message },
      duration
    ));
  }

  if (error || !data?.success) {
    throw new Error(error?.message || 'Urkunden query failed');
  }

  return data.data;
}

// Mock address lookup (for testing)
export async function mockAddressLookup(
  _straat: string,
  _huisnummer: string,
  _postcode: string,
  _plaats: string
): Promise<{
  kgNummer: string;
  kgName: string;
  einlagezahl: string;
  gericht: string;
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Return mock data
  return {
    kgNummer: '01002',
    kgName: 'Wien Innere Stadt',
    einlagezahl: '1234',
    gericht: 'BG Innere Stadt Wien',
  };
}
