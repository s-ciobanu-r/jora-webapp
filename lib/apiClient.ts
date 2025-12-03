import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// API Base URL from environment
const API_BASE = process.env.NEXT_PUBLIC_JORA_API_BASE || 'http://localhost:5678/webhook';
const API_KEY = process.env.NEXT_PUBLIC_JORA_FRONTEND_API_KEY;

// -------------------------
// CLIENT 1: SEARCH (GET ONLY)
// Uses the /webhook prefix
// -------------------------
const apiSearch = axios.create({
  baseURL: API_BASE, // this includes /webhook
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiSearch.interceptors.request.use((config) => {
  if (API_KEY) config.headers['joraapikey'] = API_KEY;
  return config;
});

// -------------------------
// CLIENT 2: CRUD (POST / PATCH / GET BY ID)
// MUST NOT use /webhook prefix
// -------------------------
const apiCrud = axios.create({
  baseURL: API_BASE.replace('/webhook', ''), // remove /webhook
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiCrud.interceptors.request.use((config) => {
  if (API_KEY) config.headers['joraapikey'] = API_KEY;
  return config;
});

// Global error handler
const handleError = (error: AxiosError) => {
  if (!error.response) {
    toast.error("Network error. Please check your connection.");
  } else if (error.response.status === 401) {
    toast.error("Authentication failed");
  } else {
    toast.error("Server error");
  }
  return Promise.reject(error);
};

// --- Types ---

export interface ContractSessionRequest {
  user_id?: number;
  session_id: string;
  message?: string;
  action?: string;
  choice?: string;
  mode?: string;
  history?: Array<{ role: string; content: string }>;
  file_url?: string;
}

export interface ContractSessionResponse {
  session_id: string;
  stage: string;
  reply: string;
  options: { label: string; value: string }[];
  payload?: any;
  error?: string;
  session_expired?: boolean;
}

export interface Buyer {
  id: string;
  full_name: string;
  street?: string;
  street_no?: string;
  zip?: string;
  city?: string;
  phone?: string;
  email?: string | null;
  document_number?: string;
  document_authority?: string;
  created_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user_id?: number;
  name?: string;
  role?: string;
}

export interface LastContractResponse {
  ok: boolean;
  contract?: any;
}

// --- API Methods ---

const api = {
  contractSession: {
    send: async (data: ContractSessionRequest): Promise<ContractSessionResponse> => {
      try {
        const response = await apiSearch.post('/api/contract-session', data);
        return response.data;
      } catch (err) {
        return handleError(err as AxiosError);
      }
    },
  },

  buyers: {
    // GET (SEARCH) — uses /webhook/api/buyers
    search: async (searchTerm: string): Promise<Buyer[]> => {
      try {
        const response = await apiSearch.get('/api/buyers', {
          params: { search: searchTerm }
        });
        return response.data.buyers || []; // n8n returns {buyers: []}
      } catch (err) {
        return handleError(err as AxiosError);
      }
    },

    // POST (CREATE) — uses /api/buyers (NO /webhook)
    create: async (buyer: Omit<Buyer, 'id' | 'created_at'>): Promise<Buyer> => {
      try {
        const response = await apiCrud.post('/api/buyers', buyer);
        return response.data.data || response.data;
      } catch (err) {
        return handleError(err as AxiosError);
      }
    },

    // PATCH (UPDATE)
    update: async (id: string, buyer: Partial<Buyer>): Promise<Buyer> => {
      try {
        const response = await apiCrud.patch(`/api/buyers/${id}`, buyer);
        return response.data.data || response.data;
      } catch (err) {
        return handleError(err as AxiosError);
      }
    },

    // GET by ID
    getById: async (id: string): Promise<Buyer> => {
      try {
        const response = await apiCrud.get(`/api/buyers/${id}`);
        return response.data.data || response.data;
      } catch (err) {
        return handleError(err as AxiosError);
      }
    },
  },

  auth: {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
      try {
        const response = await apiSearch.post('/jora-login', credentials);
        return response.data;
      } catch (err) {
        return handleError(err as AxiosError);
      }
    },
  },

  contracts: {
    getLast: async (): Promise<LastContractResponse> => {
      try {
        const response = await apiSearch.get('/jora-last-contract');
        return response.data;
      } catch (err) {
        return handleError(err as AxiosError);
      }
    },
  },
};

export default api;
