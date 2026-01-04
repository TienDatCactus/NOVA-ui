import z from "zod";

const ExchangeRateItemSchema = z.object({
  currencyCode: z.string(),
  rateToVND: z.number(),
  source: z.string(),
  lastUpdated: z.string().datetime(),
});

const ExchangeRatesListSchema = z.array(ExchangeRateItemSchema);

const SyncExchangeRatesResponseSchema = ExchangeRatesListSchema;

const ConvertCurrencyRequestSchema = z.object({
  amount: z.number(),
  fromCurrency: z.string(),
  toCurrency: z.string(),
});

const ConvertCurrencyResponseSchema = z.object({
  amount: z.number(),
  fromCurrency: z.string(),
  toCurrency: z.string(),
  convertedAmount: z.number(),
  exchangeRate: z.number(),
});

export const ExchangeRatesSchema = {
  ExchangeRateItemSchema,
  ExchangeRatesListSchema,
  SyncExchangeRatesResponseSchema,
  ConvertCurrencyRequestSchema,
  ConvertCurrencyResponseSchema,
};
