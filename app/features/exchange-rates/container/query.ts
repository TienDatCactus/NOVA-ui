import { useQuery } from "@tanstack/react-query";
import { ExchangeRatesService } from "~/services/api/exchange-rates";

export function useGetExchangeRates({ selection }: { selection: boolean }) {
  return useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async () => await ExchangeRatesService.getExchangeRates(),
    staleTime: 5 * 60 * 1000,
    enabled: selection,
  });
}
export function useGetExchangeRatesUsd({ selection }: { selection: boolean }) {
  return useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async () => await ExchangeRatesService.getExchangeRatesUsd(),
    staleTime: 5 * 60 * 1000,
    enabled: selection,
  });
}
