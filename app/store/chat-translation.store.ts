import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ChatTranslationState {
  // User's preferred language
  userLanguage: string; // 'vi', 'en', 'ja', etc.

  // Auto-translate settings
  autoTranslateEnabled: boolean; // Global toggle for auto-translation

  // Per-session language overrides
  sessionLanguageOverrides: Record<string, string>;

  // Actions
  setUserLanguage: (lang: string) => void;
  setAutoTranslate: (enabled: boolean) => void;
  setSessionLanguage: (sessionId: string, lang: string) => void;
  clearSessionOverride: (sessionId: string) => void;
}

export const useChatTranslationStore = create<ChatTranslationState>()(
  persist(
    (set) => ({
      userLanguage: "vi",
      autoTranslateEnabled: false,
      sessionLanguageOverrides: {},

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
    }),
    {
      name: "chat-translation-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
