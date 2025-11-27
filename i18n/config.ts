import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Supported languages
export const languages = {
  ro: 'Română',
  de: 'Deutsch',
  en: 'English',
  ru: 'Русский',
} as const;

export type Language = keyof typeof languages;

// Default language
export const defaultLanguage: Language = 'ro';

// Translation messages type definition
export interface Messages {
  common: {
    appName: string;
    newContract: string;
    buyers: string;
    dashboard: string;
    login: string;
    logout: string;
    save: string;
    cancel: string;
    back: string;
    next: string;
    loading: string;
    error: string;
    success: string;
    retry: string;
    search: string;
    add: string;
    edit: string;
    delete: string;
    view: string;
    actions: string;
    noResults: string;
    confirm: string;
    startNewContract: string;
    continueContract: string;
    resetContract: string;
    sessionExpired: string;
    serverError: string;
    networkError: string;
    validationError: string;
    requiredField: string;
    invalidEmail: string;
    invalidPhone: string;
  };
  auth: {
    username: string;
    password: string;
    loginButton: string;
    loginError: string;
    loginSuccess: string;
    logoutSuccess: string;
  };
  contract: {
    contractNumber: string;
    contractDate: string;
    vehicleData: string;
    buyerData: string;
    price: string;
    summary: string;
    brandModel: string;
    vin: string;
    mileage: string;
    firstRegistration: string;
    uploadDocument: string;
    processOCR: string;
    manualEntry: string;
    reviewing: string;
    typing: string;
    botTyping: string;
    userTyping: string;
    sendMessage: string;
    selectOption: string;
    contractCreated: string;
    contractSaved: string;
    progressSteps: string;
    debugMode: string;
    showPayload: string;
    hidePayload: string;
  };
  buyers: {
    buyersList: string;
    addBuyer: string;
    editBuyer: string;
    searchBuyers: string;
    name: string;
    street: string;
    streetNumber: string;
    zipCode: string;
    city: string;
    phone: string;
    email: string;
    documentNumber: string;
    documentAuthority: string;
    createdAt: string;
    buyerAdded: string;
    buyerUpdated: string;
    buyerDeleted: string;
  };
  dashboard: {
    welcome: string;
    recentContracts: string;
    quickActions: string;
    statistics: string;
    contractsToday: string;
    contractsThisWeek: string;
    contractsThisMonth: string;
    totalBuyers: string;
    help: string;
    helpText: string;
  };
}

// Language store using Zustand
interface LanguageStore {
  language: Language;
  messages: Messages;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Import all translation files
// Ensure these paths exist in your project structure
import messagesRo from '@/i18n/messages/ro/common.json';
import messagesDe from '@/i18n/messages/de/common.json';
import messagesEn from '@/i18n/messages/en/common.json';
import messagesRu from '@/i18n/messages/ru/common.json';

const allMessages: Record<Language, Messages> = {
  ro: messagesRo as unknown as Messages,
  de: messagesDe as unknown as Messages,
  en: messagesEn as unknown as Messages,
  ru: messagesRu as unknown as Messages,
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: defaultLanguage,
      messages: allMessages[defaultLanguage],
      setLanguage: (lang: Language) => {
        set({ language: lang, messages: allMessages[lang] });
      },
      t: (key: string) => {
        const { messages } = get();
        const keys = key.split('.');
        let value: any = messages;
        
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k as keyof typeof value];
          } else {
            return key; // Return key if translation not found
          }
        }
        
        return typeof value === 'string' ? value : key;
      },
    }),
    {
      name: 'jora-language',
      storage: createJSONStorage(() => localStorage), // Use localStorage instead of js-cookie to avoid extra dependencies
      skipHydration: true, // Let components handle hydration state if needed, or rely on useEffect
    }
  )
);

// Hook for using translations in components
export const useTranslation = () => {
  const { t, language, setLanguage } = useLanguageStore();
  
  // Hydration fix for Next.js: 
  // If we wanted to be strictly server-safe, we might return default language 
  // until mounted, but since this is a client-side SPA replacement, 
  // accessing the store directly is usually fine within 'use client' components.
  
  return { t, language, setLanguage, languages };
};
