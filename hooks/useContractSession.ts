import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/apiClient';
import type { ContractSessionRequest } from '@/lib/apiClient';
import { useContractSessionStore } from '@/store/contractSessionStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

// Simple ID generator to avoid dependency on nanoid if not installed
const generateId = () => Math.random().toString(36).substring(2, 9);

// Types for the hook return value
export interface UseContractSessionReturn {
  session: {
    session_id?: string;
    stage?: string;
    payload?: any;
    session_expired?: boolean;
  } | null;
  stage?: string;
  payload: any;
  reply?: string;
  options: { label: string; value: string }[];
  isLoading: boolean;
  isInitializing: boolean;
  isError: boolean;
  sessionId?: string;
  userId: string | number;
  messages: any[];
  initSession: () => void;
  sendAction: (params: ActionParams) => void;
  resetSession: () => void;
}

export interface ActionParams {
  action?: string;
  message?: string;
  choice?: string;
  file_url?: string;
  contract_id?: string;
  [key: string]: any;
}

export function useContractSession(): UseContractSessionReturn {
  const queryClient = useQueryClient();
  
  // Stores
  const { 
    sessionId, 
    stage, 
    payload, 
    options,
    messages,
    setSessionId, 
    addMessage,
    updateState,
    clearSession,
    setLoading,
    setTyping
  } = useContractSessionStore();
  
  const { user } = useAuthStore();
  
  // Local state for last reply
  const [lastReply, setLastReply] = useState<string | undefined>(undefined);

  // Get user ID (from auth store or localStorage)
  const getUserId = useCallback(() => {
    return user?.id || (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null) || 'anonymous';
  }, [user]);

  // Helper to handle bot response
  const handleBotResponse = useCallback((data: any) => {
    // Add bot message if reply exists
    if (data.reply) {
      addMessage({
        from: 'bot',
        text: data.reply,
        options: data.options
      });
      setLastReply(data.reply);
    }

    // Update session state
    updateState({
      stage: data.stage,
      payload: data.payload,
      options: data.options || [],
    });

    // Check for session expiry
    if (data.session_expired) {
      toast.error('Session expired');
    }
  }, [addMessage, updateState]);

  // Initialize new session
  const initSessionMutation = useMutation({
    mutationFn: async () => {
      const newSessionId = `session_${Date.now()}_${generateId()}`;
      const userId = getUserId();
      
      // Optimistic update
      setSessionId(newSessionId);
      setLoading(true);

      try {
        const response = await api.contractSession.send({
          session_id: newSessionId,
          action: 'init',
          // @ts-ignore - 'mode' might not be in the strict type definition but is useful
          mode: 'web',
        });
        return response;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      handleBotResponse(data);
      console.log('Session initialized:', data.session_id);
    },
    onError: (error: any) => {
      console.error('Failed to initialize session:', error);
      toast.error('Failed to start session. Please check your connection.');
      clearSession();
    },
  });

  // Send action to state machine
  const sendActionMutation = useMutation({
    mutationFn: async (params: ActionParams) => {
      if (!sessionId) {
        throw new Error('No active session');
      }

      setLoading(true);
      setTyping(true); // Bot is "thinking"

      // Add user message to UI immediately if present
      if (params.message) {
        addMessage({
          from: 'user',
          text: params.message
        });
      } else if (params.file_url) {
        addMessage({
          from: 'user',
          text: 'Uploaded file' // Placeholder text for file upload
        });
      }

      try {
        // Construct request
        const requestData: ContractSessionRequest = {
          session_id: sessionId,
          ...params
        };

        const response = await api.contractSession.send(requestData);
        return response;
      } finally {
        setLoading(false);
        setTyping(false);
      }
    },
    onSuccess: (data) => {
      handleBotResponse(data);
      
      // Handle stage-specific success messages
      if (data.stage === 'process_finished') {
        toast.success('Contract created successfully!');
      } else if (data.stage === 'final_save_contract') {
        toast.success('Saving contract...');
      }
    },
    onError: (error: any) => {
      console.error('Action failed:', error);
      
      // Handle specific error codes
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        clearSession();
      } else if (error.response?.status === 429) {
        toast.error('Too many requests. Please slow down.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to process action.');
      }
    },
  });

  // Reset session
  const resetSession = useCallback(() => {
    clearSession();
    queryClient.removeQueries({ queryKey: ['contract-session'] });
  }, [clearSession, queryClient]);

  return {
    // Session data
    session: sessionId ? {
      session_id: sessionId,
      stage,
      payload,
    } : null,
    stage,
    payload: payload || {},
    reply: lastReply, // Current reply to show in alert/UI if needed distinct from chat history
    options: options || [],
    messages, // Expose full chat history
    
    // Actions
    initSession: initSessionMutation.mutate,
    sendAction: sendActionMutation.mutate,
    resetSession,
    
    // Loading states
    isLoading: sendActionMutation.isPending || initSessionMutation.isPending,
    isInitializing: initSessionMutation.isPending,
    isError: sendActionMutation.isError || initSessionMutation.isError,
    
    // Session info
    sessionId,
    userId: getUserId(),
  };
}

// Helper hook for specific stage actions
export function useStageAction(stage: string | undefined) {
  const { sendAction, isLoading } = useContractSession();
  
  if (!stage) {
    return {
      actions: {
        back: () => {},
        restart: () => {},
      },
      isLoading: false
    };
  }

  const stageActions: Record<string, any> = {
    // Contract number stage
    choose_contract_number: {
      selectAuto: () => sendAction({ action: 'select_number', choice: 'auto', message: 'Auto' }),
      selectManual: (number: string) => sendAction({ action: 'select_number', message: number }),
      confirm: () => sendAction({ action: 'confirm' }),
    },
    contract_number_confirm: {
      confirm: () => sendAction({ action: 'confirm' }),
      retry: () => sendAction({ action: 'retry' }),
    },
    
    // Date stage
    contract_date: {
      setDate: (date: string) => sendAction({ message: date }),
      confirm: () => sendAction({ action: 'confirm' }),
    },
    
    // Input mode stage
    choose_input_mode: {
      selectOCR: () => sendAction({ choice: 'ocr', message: 'OCR Mode' }),
      selectManual: () => sendAction({ choice: 'manual', message: 'Manual Mode' }),
    },
    
    // OCR stages
    ocr_wait_file_url: {
      uploadFile: (url: string) => sendAction({ file_url: url }),
      skip: () => sendAction({ action: 'skip_ocr', message: 'Skip OCR' }),
    },
    ocr_review: {
      confirm: () => sendAction({ action: 'confirm' }),
      edit: (field: string) => sendAction({ action: 'edit', choice: field }),
      reject: () => sendAction({ action: 'reject', message: 'Reject' }),
    },
    
    // Vehicle data stages
    vehicle_brand_model: {
      setValue: (value: string) => sendAction({ message: value }),
    },
    vehicle_vin: {
      setValue: (value: string) => sendAction({ message: value }),
      skip: () => sendAction({ action: 'skip', message: 'Skip' }),
    },
    
    // Buyer stages
    buyer_lookup_start: {
      search: (name: string) => sendAction({ message: name }),
      createNew: () => sendAction({ action: 'create_new', message: 'New Buyer' }),
    },
    buyer_lookup_confirm_single: {
      confirm: () => sendAction({ action: 'confirm', message: 'Yes' }),
      reject: () => sendAction({ action: 'reject', message: 'No' }),
    },
    buyer_lookup_confirm_multi: {
      select: (id: string) => sendAction({ choice: id }),
      createNew: () => sendAction({ action: 'create_new', message: 'New Buyer' }),
    },
    
    // Generic actions fallback
    generic: {
      back: () => sendAction({ action: 'go_back', message: 'back' }),
      restart: () => sendAction({ message: 'restart' }),
      setValue: (value: string) => sendAction({ message: value }),
      selectOption: (option: string) => sendAction({ choice: option }),
      confirm: () => sendAction({ action: 'confirm' }),
    },
  };
  
  // Merge generic actions with specific stage actions
  const specificActions = stageActions[stage] || {};
  const actions = { ...stageActions.generic, ...specificActions };
  
  return {
    actions,
    isLoading,
  };
}
