import { useCallback } from "react";
import { TranslationService } from "~/services/api/translation";
import { useChatTranslationStore } from "~/store/chat-translation.store";
import { toast } from "sonner";
import type { ChatMessage } from "~/lib/signalr";

// Languages that should not be translated
const NON_TRANSLATABLE_LANGUAGES = [
  "emoji",
  "unknown",
  "mixed",
  "und", // undefined language code
  "zxx", // no linguistic content
];

/**
 * Check if a language code should be translated
 */
export function shouldTranslate(
  detectedLang: string | undefined,
  userLang: string
): boolean {
  if (!detectedLang) return false;

  // Don't translate if same as user language
  if (detectedLang.toLowerCase() === userLang.toLowerCase()) return false;

  // Don't translate special/non-translatable languages
  if (NON_TRANSLATABLE_LANGUAGES.includes(detectedLang.toLowerCase()))
    return false;

  return true;
}

/**
 * Hook for managing message translation in chat
 * Uses persisted translation cache from Zustand store
 * Requires language detection before translation (no "auto" mode)
 */
export function useTranslateMessage() {
  const { userLanguage, translationCache, setTranslationCache } =
    useChatTranslationStore();

  /**
   * Translate a message and update its state
   * Requires message.detectedLanguage to be set first
   * @param message - The message to translate
   * @param updateMessage - Callback to update the message in parent state
   */
  const translateMessage = useCallback(
    async (
      message: ChatMessage,
      updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void
    ) => {
      // Generate cache key
      const cacheKey = `${message.message}-${userLanguage}`;

      // Check if already translated and showing
      if (message.showTranslation && message.translatedText) {
        // Toggle off - hide translation
        updateMessage(message.id, { showTranslation: false });
        return;
      }

      // Check cache (persisted in store)
      const cached = translationCache[cacheKey];
      if (cached) {
        // Show cached translation
        updateMessage(message.id, {
          translatedText: cached.translatedText,
          detectedLanguage: cached.detectedLanguage,
          showTranslation: true,
        });
        return;
      }

      // Check if language has been detected, if not, detect it now
      if (!message.detectedLanguage) {
        try {
          const detection = await TranslationService.detectLanguage(
            message.message
          );
          const detectedLang = detection?.language;

          if (!detectedLang) {
            toast.error("Không thể nhận diện ngôn ngữ");
            updateMessage(message.id, { isTranslating: false });
            return;
          }

          // Update message with detected language
          updateMessage(message.id, { detectedLanguage: detectedLang });

          // Check if translation is needed
          if (!shouldTranslate(detectedLang, userLanguage)) {
            toast.info("Tin nhắn đã ở ngôn ngữ hiện tại hoặc không thể dịch");
            updateMessage(message.id, { isTranslating: false });
            return;
          }

          // Continue with translation using detected language
          const result = await TranslationService.translateText({
            text: message.message,
            targetLanguage: userLanguage,
            sourceLanguage: detectedLang,
          });

          // Update cache (persisted)
          setTranslationCache(cacheKey, {
            translatedText: result.translatedText,
            detectedLanguage: result.detectedSourceLanguage,
          });

          // Update message with translation
          updateMessage(message.id, {
            translatedText: result.translatedText,
            detectedLanguage: result.detectedSourceLanguage,
            showTranslation: true,
            isTranslating: false,
          });
          return;
        } catch (error) {
          console.error("Language detection failed:", error);
          toast.error("Không thể nhận diện ngôn ngữ");
          updateMessage(message.id, { isTranslating: false });
          return;
        }
      }

      // Check if translation is needed for already detected language
      if (!shouldTranslate(message.detectedLanguage, userLanguage)) {
        toast.info("Tin nhắn đã ở ngôn ngữ hiện tại hoặc không thể dịch");
        return;
      }

      // Start translation with already detected language
      updateMessage(message.id, { isTranslating: true });

      try {
        const result = await TranslationService.translateText({
          text: message.message,
          targetLanguage: userLanguage,
          sourceLanguage: message.detectedLanguage, // Use detected language
        });

        // Update cache (persisted)
        setTranslationCache(cacheKey, {
          translatedText: result.translatedText,
          detectedLanguage: result.detectedSourceLanguage,
        });

        // Update message with translation
        updateMessage(message.id, {
          translatedText: result.translatedText,
          detectedLanguage: result.detectedSourceLanguage,
          showTranslation: true,
          isTranslating: false,
        });
      } catch (error) {
        console.error("Translation failed:", error);
        toast.error("Không thể dịch tin nhắn. Vui lòng thử lại.");
        updateMessage(message.id, { isTranslating: false });
      }
    },
    [userLanguage, translationCache, setTranslationCache]
  );

  /**
   * Auto-translate a message (for incoming messages)
   * Detects language first, then translates if needed
   * @param message - The message to auto-translate
   * @returns Updated message with translation or original message
   */
  const autoTranslateMessage = useCallback(
    async (message: ChatMessage): Promise<ChatMessage> => {
      try {
        // Detect language first
        const detection = await TranslationService.detectLanguage(
          message.message
        );

        const detectedLang = detection?.language;

        // Add detected language to message
        const messageWithDetection = {
          ...message,
          detectedLanguage: detectedLang,
        };

        // Check if translation is needed
        if (!shouldTranslate(detectedLang, userLanguage)) {
          return messageWithDetection;
        }

        // Check cache
        const cacheKey = `${message.message}-${userLanguage}`;
        const cached = translationCache[cacheKey];
        if (cached) {
          return {
            ...messageWithDetection,
            translatedText: cached.translatedText,
            detectedLanguage: cached.detectedLanguage,
            showTranslation: true,
          };
        }

        // Translate using detected language
        if (!detectedLang) {
          // Fallback if detection failed
          console.warn("Language detection failed, skipping translation");
          return messageWithDetection;
        }

        const result = await TranslationService.translateText({
          text: message.message,
          targetLanguage: userLanguage,
          sourceLanguage: detectedLang, // Use detected language, not "auto"
        });

        // Update cache
        setTranslationCache(cacheKey, {
          translatedText: result.translatedText,
          detectedLanguage: result.detectedSourceLanguage,
        });

        return {
          ...messageWithDetection,
          translatedText: result.translatedText,
          detectedLanguage: result.detectedSourceLanguage,
          showTranslation: true,
        };
      } catch (error) {
        console.error("Auto-translation failed:", error);
        // Return original message on failure
        return message;
      }
    },
    [userLanguage, translationCache, setTranslationCache]
  );

  return {
    translateMessage,
    autoTranslateMessage,
  };
}
