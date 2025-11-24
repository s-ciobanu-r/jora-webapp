import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useSessionStore } from '../store/sessionStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface ContractSession {
  session_id: string;
  user_id: string;
  stage: string;
  payload: Record<string, any>;
  reply?: string;
  options?: string[];
  session_expired?: boolean;
  error?: string;
}

interface ActionParams {
  action?: string;
  message?: string;
  choice?: string;
  file_url?: string;
  contract_id?: string;
  [key: string]: any;
}

export function useContractSession() {
  const queryClient = useQueryClient();
  const { sessionId, setSessionId, clearSession } = useSessionStore();
  const { user } = useAuthStore();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Generate a new session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }, []);

  // Get user ID (from auth store or localStorage)
  const getUserId = useCallback(() => {
    return user?.id || localStorage.getItem('user_id') || 'anonymous';
  }, [user]);

  // Initialize new session
  const initSessionMutation = useMutation({
    mutationFn: async () => {
      const newSessionId = generateSessionId();
      const userId = getUserId();
      
      const response = await apiClient.post('/api/contract-session', {
        user_id: userId,
        session_id: newSessionId,
        action: 'init',
        mode: 'web',
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      setSessionId(data.session_id);
      queryClient.setQueryData(['contract-session', data.session_id], data);
      setRetryCount(0);
      console.log('Session initialized:', data.session_id);
    },
    onError: (error: any) => {
      console.error('Failed to initialize session:', error);
      
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          initSessionMutation.mutate();
        }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
      } else {
        toast.error('Failed to connect to server. Please refresh the page.');
      }
    },
  });

  // Send action to state machine
  const sendActionMutation = useMutation({
    mutationFn: async (params: ActionParams) => {
      if (!sessionId) {
        throw new Error('No active session');
      }

      const response = await apiClient.post('/api/contract-session', {
        user_id: getUserId(),
        session_id: sessionId,
        ...params,
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['contract-session', sessionId], data);
      
      // Handle stage-specific success messages
      if (data.stage === 'process_finished') {
        toast.success('Contract created successfully!');
      } else if (data.stage === 'final_save_contract') {
        toast.success('Saving contract...');
      }
      
      // Handle errors from the state machine
      if (data.error) {
        toast.error(data.error);
      }
    },
    onError: (error: any) => {
      console.error('Action failed:', error);
      
      // Handle specific error codes
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        clearSession();
        window.location.href = '/login';
      } else if (error.response?.status === 429) {
        toast.error('Too many requests. Please slow down.');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Invalid input');
      } else {
        toast.error('Failed to process action. Please try again.');
      }
    },
  });

  // Query current session state
  const sessionQuery = useQuery({
    queryKey: ['contract-session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      
      const response = await apiClient.post('/api/contract-session', {
        user_id: getUserId(),
        session_id: sessionId,
        action: 'get_state',
      });
      
      return response.data;
    },
    enabled: !!sessionId,
    refetchInterval: false, // Disable auto-refetch
    staleTime: Infinity, // Keep data fresh
  });

  // Reset session
  const resetSession = useCallback(() => {
    clearSession();
    queryClient.removeQueries({ queryKey: ['contract-session'] });
    setRetryCount(0);
  }, [clearSession, queryClient]);

  // Auto-save draft
  useEffect(() => {
    if (!sessionId || !sessionQuery.data?.payload) return;
    
    const saveTimer = setTimeout(() => {
      // Save draft to localStorage
      const draft = {
        sessionId,
        stage: sessionQuery.data.stage,
        payload: sessionQuery.data.payload,
        timestamp: Date.now(),
      };
      localStorage.setItem('contract_draft', JSON.stringify(draft));
    }, 2000); // Save after 2 seconds of inactivity
    
    return () => clearTimeout(saveTimer);
  }, [sessionId, sessionQuery.data]);

  // Restore draft on mount
  useEffect(() => {
    const draftStr = localStorage.getItem('contract_draft');
    if (draftStr && !sessionId) {
      try {
        const draft = JSON.parse(draftStr);
        const age = Date.now() - draft.timestamp;
        
        // Restore if less than 1 hour old
        if (age < 3600000) {
          if (window.confirm('Found an unsaved draft. Would you like to continue?')) {
            setSessionId(draft.sessionId);
            queryClient.setQueryData(['contract-session', draft.sessionId], {
              session_id: draft.sessionId,
              stage: draft.stage,
              payload: draft.payload,
            });
          } else {
            localStorage.removeItem('contract_draft');
          }
        }
      } catch (error) {
        console.error('Failed to restore draft:', error);
      }
    }
  }, []);

  return {
    // Session data
    session: sessionQuery.data,
    stage: sessionQuery.data?.stage,
    payload: sessionQuery.data?.payload || {},
    reply: sessionQuery.data?.reply,
    options: sessionQuery.data?.options || [],
    
    // Actions
    initSession: initSessionMutation.mutate,
    sendAction: sendActionMutation.mutate,
    resetSession,
    
    // Loading states
    isLoading: sendActionMutation.isPending || sessionQuery.isLoading,
    isInitializing: initSessionMutation.isPending,
    isError: sessionQuery.isError || sendActionMutation.isError,
    
    // Session info
    sessionId,
    userId: getUserId(),
  };
}

// Helper hook for specific stage actions
export function useStageAction(stage: string) {
  const { sendAction, isLoading } = useContractSession();
  
  const stageActions = {
    // Contract number stage
    choose_contract_number: {
      selectAuto: () => sendAction({ action: 'select_number', choice: 'auto' }),
      selectManual: (number: string) => sendAction({ action: 'select_number', message: number }),
      confirm: () => sendAction({ action: 'confirm' }),
    },
    
    // Date stage
    contract_date: {
      setDate: (date: string) => sendAction({ message: date }),
      confirm: () => sendAction({ action: 'confirm' }),
    },
    
    // Input mode stage
    choose_input_mode: {
      selectOCR: () => sendAction({ choice: 'ocr' }),
      selectManual: () => sendAction({ choice: 'manual' }),
      confirm: () => sendAction({ action: 'confirm' }),
    },
    
    // OCR stages
    ocr_wait_file_url: {
      uploadFile: (url: string) => sendAction({ file_url: url }),
      skip: () => sendAction({ action: 'skip_ocr' }),
    },
    
    ocr_review: {
      confirm: () => sendAction({ action: 'confirm' }),
      edit: (field: string) => sendAction({ action: 'edit', choice: field }),
      reject: () => sendAction({ action: 'reject' }),
    },
    
    // Vehicle data stages
    vehicle_brand_model: {
      setValue: (value: string) => sendAction({ message: value }),
      confirm: () => sendAction({ action: 'confirm' }),
    },
    
    vehicle_vin: {
      setValue: (value: string) => sendAction({ message: value }),
      confirm: () => sendAction({ action: 'confirm' }),
      skip: () => sendAction({ action: 'skip' }),
    },
    
    // Buyer stages
    buyer_lookup_start: {
      search: (name: string) => sendAction({ message: name }),
      createNew: () => sendAction({ action: 'create_new' }),
    },
    
    buyer_lookup_confirm_single: {
      confirm: () => sendAction({ action: 'confirm' }),
      reject: () => sendAction({ action: 'reject' }),
    },
    
    buyer_lookup_confirm_multi: {
      select: (id: string) => sendAction({ choice: id }),
      createNew: () => sendAction({ action: 'create_new' }),
    },
    
    // Price stage
    price_input: {
      setPrice: (price: string) => sendAction({ message: price }),
      confirm: () => sendAction({ action: 'confirm' }),
    },
    
    // Summary stages
    summary_review: {
      confirm: () => sendAction({ action: 'confirm' }),
      edit: (field: string) => sendAction({ action: 'edit', choice: field }),
    },
    
    final_confirm: {
      confirm: () => sendAction({ action: 'confirm' }),
      cancel: () => sendAction({ action: 'cancel' }),
    },
    
    // Generic actions
    generic: {
      back: () => sendAction({ action: 'go_back' }),
      restart: () => sendAction({ message: 'restart' }),
      setValue: (value: string) => sendAction({ message: value }),
      selectOption: (option: string) => sendAction({ choice: option }),
    },
  };
  
  return {
    actions: stageActions[stage as keyof typeof stageActions] || stageActions.generic,
    isLoading,
  };
}
