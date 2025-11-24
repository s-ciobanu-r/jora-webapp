import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

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

// Translation messages type
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
import messagesRo from '@/i18n/messages/ro/common.json';
import messagesDe from '@/i18n/messages/de/common.json';
import messagesEn from '@/i18n/messages/en/common.json';
import messagesRu from '@/i18n/messages/ru/common.json';

const allMessages: Record<Language, Messages> = {
  ro: messagesRo as Messages,
  de: messagesDe as Messages,
  en: messagesEn as Messages,
  ru: messagesRu as Messages,
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: defaultLanguage,
      messages: allMessages[defaultLanguage],
      setLanguage: (lang: Language) => {
        Cookies.set('jora-language', lang, { expires: 365 });
        set({ language: lang, messages: allMessages[lang] });
      },
      t: (key: string) => {
        const { messages } = get();
        const keys = key.split('.');
        let value: any = messages;
        
        for (const k of keys) {
          value = value?.[k];
        }
        
        return value || key;
      },
    }),
    {
      name: 'jora-language',
      onRehydrateStorage: () => (state) => {
        // Check cookie on rehydration
        const cookieLang = Cookies.get('jora-language') as Language;
        if (cookieLang && languages[cookieLang]) {
          state?.setLanguage(cookieLang);
        }
      },
    }
  )
);

// Hook for using translations
export const useTranslation = () => {
  const { t, language, setLanguage } = useLanguageStore();
  return { t, language, setLanguage, languages };
};
