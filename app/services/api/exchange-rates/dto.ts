import type z from "zod";
import { ExchangeRatesSchema } from "./exchange-rates.schema";

const {
  ConvertCurrencyRequestSchema,
  ConvertCurrencyResponseSchema,
  ExchangeRatesListSchema,
  SyncExchangeRatesResponseSchema,
} = ExchangeRatesSchema;

export type ConvertCurrencyRequest = z.infer<
  typeof ConvertCurrencyRequestSchema
>;
export type ConvertCurrencyResponse = z.infer<
  typeof ConvertCurrencyResponseSchema
>;
export type ExchangeRatesList = z.infer<typeof ExchangeRatesListSchema>;
export type SyncExchangeRatesResponse = z.infer<
  typeof SyncExchangeRatesResponseSchema
>;
