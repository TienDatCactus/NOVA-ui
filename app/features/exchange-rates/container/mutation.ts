import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ExchangeRatesService } from "~/services/api/exchange-rates";
import type { ConvertCurrencyRequest } from "~/services/api/exchange-rates/dto";

function useConvertCurrency() {
  return useMutation({
    mutationKey: ["convert-currency"],
    mutationFn: async (data: ConvertCurrencyRequest) => {
      return await ExchangeRatesService.convertCurrency(data);
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    },
  });
}
function useSyncExchangeRates() {
  return useMutation({
    mutationKey: ["sync-exchange-rates"],
    mutationFn: async () => {
      return await ExchangeRatesService.syncExchangeRates();
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    },
  });
}

export { useConvertCurrency, useSyncExchangeRates };
