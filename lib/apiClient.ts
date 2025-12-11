import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// --- BASE URL & CONFIG ---

// Example: https://johnbaton.app.n8n.cloud/webhook
const N8N_BASE = process.env.NEXT_PUBLIC_JORA_API_BASE || 'http://localhost:5678/webhook';
const API_KEY = process.env.NEXT_PUBLIC_JORA_FRONTEND_API_KEY;

// Important: we do NOT use baseURL here, we always pass full URLs
const apiClient: AxiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add joraapikey header to all requests
apiClient.interceptors.request.use(
  (config) => {
    if (API_KEY) {
      config.headers['joraapikey'] = API_KEY;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed - check joraapikey');
      toast.error('Authentication failed. Please check API configuration.');
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
      toast.error('Server error occurred');
    } else if (!error.response) {
      console.error('Network error:', error.message);
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

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

// --- N8N ENDPOINT URLS ---

// All share the same base: https://johnbaton.app.n8n.cloud/webhook

// Contract session
const CONTRACT_SESSION_URL = `${N8N_BASE}/api/contract-session`;

// Buyers search + create (same URL, different method)
const BUYERS_SEARCH_CREATE_URL = `${N8N_BASE}/api/buyers`;

// Buyers update by id (UUID-based webhook)
const BUYERS_UPDATE_BASE_URL = `${N8N_BASE}/a8887709-d61f-4741-bd26-b5e5ec5d1731/api/buyers`;
// Full PATCH URL will be: `${BUYERS_UPDATE_BASE_URL}/${id}`
// → https://johnbaton.app.n8n.cloud/webhook/a8887709-d61f-4741-bd26-b5e5ec5d1731/api/buyers/123

// If later you wire a dedicated GET /buyers/:id webhook with its own UUID,
// you can add another constant here.

// Auth & last contract
const LOGIN_URL = `${N8N_BASE}/jora-login`;
const LAST_CONTRACT_URL = `${N8N_BASE}/jora-last-contract`;

// --- API METHODS ---

const api = {
  // Contract Session State Machine
  // Endpoint: POST /webhook/api/contract-session
  contractSession: {
    send: async (data: ContractSessionRequest): Promise<ContractSessionResponse> => {
      const response = await apiClient.post<ContractSessionResponse>(
        CONTRACT_SESSION_URL,
        data
      );
      return response.data;
    },
  },

  // Buyers CRUD
  buyers: {
    // GET /webhook/api/buyers?search=...
    search: async (searchTerm: string): Promise<Buyer[]> => {
      const response = await apiClient.get(BUYERS_SEARCH_CREATE_URL, {
        params: { search: searchTerm },
      });

      // n8n returns: { buyers: [...] }
      return (response.data as any).buyers || [];
    },

    // POST /webhook/api/buyers
    create: async (buyer: Omit<Buyer, 'id' | 'created_at'>): Promise<Buyer> => {
      const response = await apiClient.post<Buyer>(
        BUYERS_SEARCH_CREATE_URL,
        buyer
      );
      // your n8n "Build Create Success Response" returns { success: true, data: buyer }
      const data: any = response.data;
      return data.data || data;
    },

    // PATCH /webhook/a8887709-d61f-4741-bd26-b5e5ec5d1731/api/buyers/:id
    update: async (
      id: string,
      buyer: Partial<Omit<Buyer, 'id' | 'created_at'>>
    ): Promise<Buyer> => {
      const url = `${BUYERS_UPDATE_BASE_URL}/${id}`;
      const response = await apiClient.patch<Buyer>(url, buyer);
      const data: any = response.data;
      return data.data || data;
    },

    // Currently not used by your UI; we can point it to the same update URL for now.
    // Later, if you create a dedicated GET /api/buyers/:id webhook with its own UUID,
    // just change this URL accordingly.
    getById: async (id: string): Promise<Buyer> => {
      const url = `${BUYERS_UPDATE_BASE_URL}/${id}`;
      const response = await apiClient.get<Buyer>(url);
      const data: any = response.data;
      return data.data || data;
    },
  },

  // Authentication
  // Endpoint: POST /webhook/jora-login
  auth: {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>(LOGIN_URL, credentials);
      return response.data;
    },
  },

  // Last Contract
  // Endpoint: GET /webhook/jora-last-contract
  contracts: {
    getLast: async (): Promise<LastContractResponse> => {
      const response = await apiClient.get<LastContractResponse>(LAST_CONTRACT_URL);
      return response.data;
    },
  },
};

export default api;
