import { create } from 'zustand';
import type {
  Environment,
  WizardStep,
  TokenState,
  AddressData,
  LookupResult,
  AbfrageConfig,
  AbfrageResponse,
  APILogEntry,
} from '@/types/grundbuch-api';

interface GrundbuchTestState {
  // Environment
  environment: Environment;
  setEnvironment: (env: Environment) => void;

  // Auth
  token: TokenState;
  setToken: (token: TokenState) => void;
  clearToken: () => void;
  isTokenValid: () => boolean;

  // Workflow
  currentStep: WizardStep;
  setCurrentStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Address
  addressData: AddressData;
  setAddressData: (data: Partial<AddressData>) => void;
  lookupResult: LookupResult | null;
  setLookupResult: (result: LookupResult | null) => void;

  // Abfrage
  abfrageConfig: AbfrageConfig;
  setAbfrageConfig: (config: Partial<AbfrageConfig>) => void;
  abfrageResult: AbfrageResponse | null;
  setAbfrageResult: (result: AbfrageResponse | null) => void;

  // Urkunden
  urkundenResult: AbfrageResponse | null;
  setUrkundenResult: (result: AbfrageResponse | null) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // API Logs
  apiLogs: APILogEntry[];
  addApiLog: (log: APILogEntry) => void;
  clearApiLogs: () => void;

  // Reset
  reset: () => void;
}

const initialAddressData: AddressData = {
  straat: '',
  huisnummer: '',
  postcode: '',
  plaats: '',
};

const initialAbfrageConfig: AbfrageConfig = {
  historisch: true,
  signiert: true,
  linked: false,
  format: 'PDF',
};

const initialTokenState: TokenState = {
  value: null,
  expiresAt: null,
  type: null,
};

export const useGrundbuchTestStore = create<GrundbuchTestState>((set, get) => ({
  // Environment
  environment: 'test',
  setEnvironment: (env) => set({ environment: env }),

  // Auth
  token: initialTokenState,
  setToken: (token) => set({ token }),
  clearToken: () => set({ token: initialTokenState }),
  isTokenValid: () => {
    const { token } = get();
    if (!token.value || !token.expiresAt) return false;
    return Date.now() < token.expiresAt;
  },

  // Workflow
  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ 
    currentStep: Math.min(state.currentStep + 1, 4) as WizardStep 
  })),
  prevStep: () => set((state) => ({ 
    currentStep: Math.max(state.currentStep - 1, 1) as WizardStep 
  })),

  // Address
  addressData: initialAddressData,
  setAddressData: (data) => set((state) => ({
    addressData: { ...state.addressData, ...data }
  })),
  lookupResult: null,
  setLookupResult: (result) => set({ lookupResult: result }),

  // Abfrage
  abfrageConfig: initialAbfrageConfig,
  setAbfrageConfig: (config) => set((state) => ({
    abfrageConfig: { ...state.abfrageConfig, ...config }
  })),
  abfrageResult: null,
  setAbfrageResult: (result) => set({ abfrageResult: result }),

  // Urkunden
  urkundenResult: null,
  setUrkundenResult: (result) => set({ urkundenResult: result }),

  // UI State
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),

  // API Logs
  apiLogs: [],
  addApiLog: (log) => set((state) => ({
    apiLogs: [log, ...state.apiLogs].slice(0, 50) // Keep last 50 logs
  })),
  clearApiLogs: () => set({ apiLogs: [] }),

  // Reset
  reset: () => set({
    token: initialTokenState,
    currentStep: 1,
    addressData: initialAddressData,
    lookupResult: null,
    abfrageConfig: initialAbfrageConfig,
    abfrageResult: null,
    urkundenResult: null,
    isLoading: false,
    error: null,
    apiLogs: [],
  }),
}));
