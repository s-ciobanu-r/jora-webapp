import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export interface ChatMessage {
  id: string;
  from: 'bot' | 'user';
  text: string;
  createdAt: string;
  options?: { label: string; value: string }[];
}

export interface ContractSessionState {
  sessionId?: string;
  messages: ChatMessage[];
  stage?: string;
  options: { label: string; value: string }[];
  payload?: any;
  isLoading: boolean;
  isTyping: boolean;
  
  // Actions
  setSessionId: (id: string) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  updateState: (state: Partial<ContractSessionState>) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
}

export const useContractSessionStore = create<ContractSessionState>()(
  persist(
    (set) => ({
      sessionId: undefined,
      messages: [],
      stage: undefined,
      options: [],
      payload: undefined,
      isLoading: false,
      isTyping: false,
      
      setSessionId: (id: string) => set({ sessionId: id }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, {
          ...message,
          id: nanoid(),
          createdAt: new Date().toISOString(),
        }],
      })),
      
      updateState: (newState) => set((state) => ({
        ...state,
        ...newState,
      })),
      
      clearSession: () => set({
        sessionId: undefined,
        messages: [],
        stage: undefined,
        options: [],
        payload: undefined,
        isLoading: false,
        isTyping: false,
      }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setTyping: (typing: boolean) => set({ isTyping: typing }),
    }),
    {
      name: 'jora-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        messages: state.messages,
        stage: state.stage,
        payload: state.payload,
      }),
    }
  )
);
