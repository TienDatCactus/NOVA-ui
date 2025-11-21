import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TranslationCacheItem {
  translatedText: string;
  detectedLanguage: string;
}

interface ChatTranslationState {
  // User's preferred language
  userLanguage: string; // 'vi', 'en', 'ja', etc.

  // Auto-translate settings
  autoTranslateEnabled: boolean; // Global toggle for auto-translation

  // Per-session language overrides
  sessionLanguageOverrides: Record<string, string>;

  // Translation cache (persisted)
  translationCache: Record<string, TranslationCacheItem>;

  // Actions
  setUserLanguage: (lang: string) => void;
  setAutoTranslate: (enabled: boolean) => void;
  setSessionLanguage: (sessionId: string, lang: string) => void;
  clearSessionOverride: (sessionId: string) => void;
  setTranslationCache: (key: string, value: TranslationCacheItem) => void;
  clearTranslationCache: () => void;
}

export const useChatTranslationStore = create<ChatTranslationState>()(
  persist(
    (set) => ({
      userLanguage: "vi",
      autoTranslateEnabled: false,
      sessionLanguageOverrides: {},
      translationCache: {},

      setUserLanguage: (lang) => set({ userLanguage: lang }),
      setAutoTranslate: (enabled) => set({ autoTranslateEnabled: enabled }),
      setSessionLanguage: (sessionId, lang) =>
        set((state) => ({
          sessionLanguageOverrides: {
            ...state.sessionLanguageOverrides,
            [sessionId]: lang,
          },
        })),
      clearSessionOverride: (sessionId) =>
        set((state) => {
          const { [sessionId]: _, ...rest } = state.sessionLanguageOverrides;
          return { sessionLanguageOverrides: rest };
        }),
      setTranslationCache: (key, value) =>
        set((state) => ({
          translationCache: {
            ...state.translationCache,
            [key]: value,
          },
        })),
      clearTranslationCache: () => set({ translationCache: {} }),
    }),
    {
      name: "chat-translation-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
