import http from "~/lib/http";
import type {
  ConvertCurrencyRequest,
  ConvertCurrencyResponse,
  ExchangeRatesList,
  SyncExchangeRatesResponse,
} from "./dto";
import { ExchangeRatesSchema } from "./exchange-rates.schema";
import { ExchangeRates } from "~/services/url";

const {
  ConvertCurrencyRequestSchema,
  ConvertCurrencyResponseSchema,
  ExchangeRatesListSchema,
  SyncExchangeRatesResponseSchema,
} = ExchangeRatesSchema;

async function getExchangeRates(): Promise<ExchangeRatesList> {
  try {
    const resp = await http.get(ExchangeRates.getExchangeRates);
    return ExchangeRatesListSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getExchangeRatesUsd(): Promise<ExchangeRatesList> {
  try {
    const resp = await http.get(ExchangeRates.getExchangeRatesUsd);
    return ExchangeRatesListSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function syncExchangeRates(): Promise<SyncExchangeRatesResponse> {
  try {
    const resp = await http.post(ExchangeRates.syncExchangeRates);
    return SyncExchangeRatesResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function convertCurrency(
  data: ConvertCurrencyRequest
): Promise<ConvertCurrencyResponse> {
  try {
    const resp = await http.post(
      ExchangeRates.convertCurrency,
      ConvertCurrencyRequestSchema.parse(data)
    );
    return ConvertCurrencyResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const ExchangeRatesService = {
  getExchangeRates,
  getExchangeRatesUsd,
  syncExchangeRates,
  convertCurrency,
};
