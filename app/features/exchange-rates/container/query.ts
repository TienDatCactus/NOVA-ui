import { useQuery } from "@tanstack/react-query";
import { ExchangeRatesService } from "~/services/api/exchange-rates";

export function useGetExchangeRates() {
  return useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async () => await ExchangeRatesService.getExchangeRates(),
    staleTime: 5 * 60 * 1000,
  });
}
export function useGetExchangeRatesUsd() {
  return useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async () => await ExchangeRatesService.getExchangeRatesUsd(),
    staleTime: 5 * 60 * 1000,
  });
}
