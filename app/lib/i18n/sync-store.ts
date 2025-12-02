import { useChatTranslationStore } from "~/store/chat-translation.store";
import i18n from "./index";

/**
 * Sync i18n language with chat translation store
 * This ensures language selection is consistent across chat translation and UI translation
 */
export function syncI18nWithStore() {
  const { userLanguage, setUserLanguage } = useChatTranslationStore.getState();

  // Initial sync: if store has a language preference, use it
  if (userLanguage && userLanguage !== i18n.language) {
    i18n.changeLanguage(userLanguage);
  }

  // Subscribe to store changes
  const unsubscribe = useChatTranslationStore.subscribe((state) => {
    if (state.userLanguage !== i18n.language) {
      i18n.changeLanguage(state.userLanguage);
    }
  });

  // Listen to i18n language changes (from language detector or manual change)
  i18n.on("languageChanged", (lng) => {
    const currentStoreLang = useChatTranslationStore.getState().userLanguage;
    if (lng !== currentStoreLang) {
      setUserLanguage(lng);
    }
  });

  return unsubscribe;
}
