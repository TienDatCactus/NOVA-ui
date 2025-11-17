import { useState, useCallback } from "react";
import { TranslationService } from "~/services/api/translation";
import { useChatTranslationStore } from "~/store/chat-translation.store";
import { toast } from "sonner";
import type { ChatMessage } from "~/lib/signalr";

interface TranslationCache {
  text: string;
  detectedLanguage: string;
}

/**
 * Hook for managing message translation in chat
 * Provides translation cache, translate function, and toggle functionality
 */
export function useTranslateMessage() {
  const { userLanguage } = useChatTranslationStore();
  const [translationCache, setTranslationCache] = useState<
    Map<string, TranslationCache>
  >(new Map());

  /**
   * Translate a message and update its state
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

      // Check cache
      const cached = translationCache.get(cacheKey);
      if (cached) {
        // Show cached translation
        updateMessage(message.id, {
          translatedText: cached.text,
          detectedLanguage: cached.detectedLanguage,
          showTranslation: true,
        });
        return;
      }

      // Start translation
      updateMessage(message.id, { isTranslating: true });

      try {
        const result = await TranslationService.translateText({
          text: message.message,
          targetLanguage: userLanguage,
          sourceLanguage: "auto", // Auto-detect source language
        });

        // Update cache
        setTranslationCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(cacheKey, {
            text: result.translatedText,
            detectedLanguage: result.detectedSourceLanguage,
          });
          return newCache;
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
    [userLanguage, translationCache]
  );

  /**
   * Auto-translate a message (for incoming messages)
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

        // If detected language is same as user language, no need to translate
        if (detection?.language === userLanguage) {
          return message;
        }

        // Check cache
        const cacheKey = `${message.message}-${userLanguage}`;
        const cached = translationCache.get(cacheKey);
        if (cached) {
          return {
            ...message,
            translatedText: cached.text,
            detectedLanguage: cached.detectedLanguage,
            showTranslation: true,
          };
        }

        // Translate
        const result = await TranslationService.translateText({
          text: message.message,
          targetLanguage: userLanguage,
          sourceLanguage: detection?.language || "auto",
        });

        // Update cache
        setTranslationCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(cacheKey, {
            text: result.translatedText,
            detectedLanguage: result.detectedSourceLanguage,
          });
          return newCache;
        });

        return {
          ...message,
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
    [userLanguage, translationCache]
  );

  return {
    translateMessage,
    autoTranslateMessage,
    translationCache,
  };
}
