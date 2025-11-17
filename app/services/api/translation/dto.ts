import type z from "zod";
import { TranslationSchema } from "./translation.schema";

const { TranslateTextRequestSchema, TranslateTextResponseSchema } =
  TranslationSchema;

export type TranslateTextRequestDto = z.infer<
  typeof TranslateTextRequestSchema
>;
export type TranslateTextResponseDto = z.infer<
  typeof TranslateTextResponseSchema
>;
