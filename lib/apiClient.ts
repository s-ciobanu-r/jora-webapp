import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// API Base URL from environment
const API_BASE = process.env.NEXT_PUBLIC_JORA_API_BASE || 'http://localhost:5678/webhook/api';
const API_KEY = process.env.NEXT_PUBLIC_JORA_FRONTEND_API_KEY;

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add joraapikey header to all requests
apiClient.interceptors.request.use(
  (config) => {
    // CRITICAL: Add joraapikey header to all requests
    if (API_KEY) {
      config.headers['joraapikey'] = API_KEY;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
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
      // Network error
      console.error('Network error:', error.message);
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

// --- Types ---

// Contract Session Types
export interface ContractSessionRequest {
  session_id?: string;
  message?: string;
  action?: string;
  contract_id?: string;
  file_url?: string;
  choice?: string;
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

// Buyer Types
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

// Login Types
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

// Last Contract Types
export interface LastContractResponse {
  ok: boolean;
  contract?: any;
}

// --- API Methods ---

const api = {
  // Contract Session State Machine
  contractSession: {
    send: async (data: ContractSessionRequest): Promise<ContractSessionResponse> => {
      const response = await apiClient.post<ContractSessionResponse>('/contract-session', data);
      return response.data;
    },
  },

  // Buyers CRUD
  buyers: {
    search: async (searchTerm: string): Promise<Buyer[]> => {
      const response = await apiClient.get<Buyer[]>('/buyers', {
        params: { search: searchTerm },
      });
      return response.data;
    },
    
    create: async (buyer: Omit<Buyer, 'id' | 'created_at'>): Promise<Buyer> => {
      const response = await apiClient.post<Buyer>('/buyers', buyer);
      return response.data;
    },
    
    update: async (id: string, buyer: Partial<Omit<Buyer, 'id' | 'created_at'>>): Promise<Buyer> => {
      const response = await apiClient.patch<Buyer>(`/buyers/${id}`, buyer);
      return response.data;
    },
    
    getById: async (id: string): Promise<Buyer> => {
      const response = await apiClient.get<Buyer>(`/buyers/${id}`);
      return response.data;
    },
  },

  // Authentication
  auth: {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/jora-login', credentials);
      return response.data;
    },
  },

  // Last Contract
  contracts: {
    getLast: async (): Promise<LastContractResponse> => {
      const response = await apiClient.get<LastContractResponse>('/jora-last-contract');
      return response.data;
    },
  },
};

export default api;
