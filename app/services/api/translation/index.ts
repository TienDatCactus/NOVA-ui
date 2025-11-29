import http from "~/lib/http";
import type {
  DetectLanguageResponseDto,
  TranslateTextRequestDto,
  TranslateTextResponseDto,
} from "./dto";
import { Translation } from "~/services/url";
import { TranslationSchema } from "./translation.schema";
const { TranslateTextResponseSchema, DetectLanguageResponseSchema } =
  TranslationSchema;

async function translateText(
  data: TranslateTextRequestDto
): Promise<TranslateTextResponseDto> {
  try {
    const resp = await http.post(Translation.translate, data);
    return TranslateTextResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function detectLanguage(
  text: string
): Promise<DetectLanguageResponseDto> {
  try {
    const resp = await http.get(Translation.detect(text));
    return DetectLanguageResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
export const TranslationService = {
  translateText,
  detectLanguage,
};
