import z from "zod";

const TranslateTextRequestSchema = z.object({
  text: z.string("Nội dung không hợp lệ"),
  targetLanguage: z.string(),
  sourceLanguage: z.string(),
});

const TranslateTextResponseSchema = z.object({
  translatedText: z.string(),
  detectedSourceLanguage: z.string(),
});

const DetectLanguageResponseSchema = z.object({
  language: z.string(),
});
export const TranslationSchema = {
  TranslateTextRequestSchema,
  TranslateTextResponseSchema,
  DetectLanguageResponseSchema,
};
