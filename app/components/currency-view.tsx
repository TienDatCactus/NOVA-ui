import { createContext, useContext, useEffect, useState } from "react";
import { useGetExchangeRates } from "~/features/exchange-rates/container/query";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Button } from "./ui/button";
import { useConvertCurrency } from "~/features/exchange-rates/container/mutation";
import { Label } from "./ui/label";
import { ChevronDown, Eye, EyeOff } from "lucide-react";

type CurrencyViewContextType = {
  targetCurrency?: string;
  handleSelectCurrency?: (currencyCode: string) => void;
  amountVND: number;
  setAmountVND: (amount: number) => void;
  convertedAmount?: number;
  showConverter: boolean;
  toggleConverter: () => void;
};
export const CurrencyViewContext =
  createContext<CurrencyViewContextType | null>(null);

export const useCurrencyView = () => {
  const context = useContext(CurrencyViewContext);
  if (!context) {
    throw new Error(
      "useCurrencyView must be used within a CurrencyViewProvider"
    );
  }
  return context;
};

type CurrencyViewProps = {
  children: React.ReactNode;
  /** External amount in VND to convert (e.g., from cart total) */
  amount?: number;
};
function CurrencyView({ children, amount: externalAmount }: CurrencyViewProps) {
  const [targetCurrency, setTargetCurrency] = useState<string>("USD");
  const [amountVND, setAmountVND] = useState<number>(0);
  const [convertedAmount, setConvertedAmount] = useState<number>();
  const [showConverter, setShowConverter] = useState<boolean>(false);

  const { mutate: convert } = useConvertCurrency();

  const toggleConverter = () => setShowConverter((prev) => !prev);

  // Sync external amount to internal state
  useEffect(() => {
    if (externalAmount !== undefined) {
      setAmountVND(externalAmount);
    }
  }, [externalAmount]);

  // Convert whenever amount or currency changes
  useEffect(() => {
    if (amountVND > 0 && targetCurrency) {
      convert(
        {
          amount: amountVND,
          fromCurrency: "VND",
          toCurrency: targetCurrency,
        },
        {
          onSuccess: (data) => {
            setConvertedAmount(data.convertedAmount);
          },
        }
      );
    } else {
      setConvertedAmount(0);
    }
  }, [amountVND, targetCurrency, convert]);

  const handleSelectCurrency = (currencyCode: string) => {
    setTargetCurrency(currencyCode);
  };

  return (
    <CurrencyViewContext.Provider
      value={{
        targetCurrency,
        amountVND,
        setAmountVND,
        handleSelectCurrency,
        convertedAmount,
        showConverter,
        toggleConverter,
      }}
    >
      {children}
    </CurrencyViewContext.Provider>
  );
}

const CurrencySelect = () => {
  const { data: exchangeRates, isLoading, error } = useGetExchangeRates();
  const { targetCurrency, handleSelectCurrency, showConverter } =
    useCurrencyView();
  const [open, setOpen] = useState(false);

  if (!showConverter) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          {targetCurrency || "Chọn tiền tệ"}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Tìm kiếm tỉ giá..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Đang tải...
              </div>
            )}
            {error && (
              <div className="py-6 text-center text-sm text-destructive">
                Đã xảy ra lỗi: {error.message}
              </div>
            )}
            {exchangeRates?.map((rate) => (
              <CommandItem
                key={rate.currencyCode}
                value={rate.currencyCode}
                onSelect={() => {
                  handleSelectCurrency?.(rate.currencyCode);
                  setOpen(false);
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{rate.currencyCode}</span>
                  <span className="text-xs text-muted-foreground">
                    Tỷ giá: {rate.rateToVND.toLocaleString("vi-VN")}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

type MoneyDisplayProps = {
  /** Show label above the converted amount */
  showLabel?: boolean;
};

const MoneyDisplay: React.FC<MoneyDisplayProps> = ({ showLabel = true }) => {
  const { targetCurrency, convertedAmount, amountVND, showConverter } =
    useCurrencyView();

  if (!showConverter || !targetCurrency || amountVND === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {showLabel && (
        <Label className="text-sm text-muted-foreground">
          Quy đổi sang {targetCurrency}
        </Label>
      )}
      <data
        value={convertedAmount}
        className="block text-2xl font-bold text-primary font-mono"
      >
        {convertedAmount !== undefined
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: targetCurrency,
              minimumFractionDigits: 2,
            }).format(convertedAmount)
          : "..."}
      </data>
    </div>
  );
};

const Toggle = () => {
  const { showConverter, toggleConverter } = useCurrencyView();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleConverter}
      className="gap-2"
    >
      {showConverter ? (
        <>
          <EyeOff className="h-4 w-4" />
          Ẩn quy đổi tiền tệ
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          Hiện quy đổi tiền tệ
        </>
      )}
    </Button>
  );
};

CurrencyView.Toggle = Toggle;
CurrencyView.Select = CurrencySelect;
CurrencyView.Display = MoneyDisplay;

export default CurrencyView;
