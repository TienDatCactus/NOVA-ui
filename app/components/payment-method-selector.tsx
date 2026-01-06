import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import {
  getAvailablePaymentMethods,
  type BookingSourceType,
} from "~/services/types/payment-filter.types";

interface PaymentMethodSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  bookingSource?: BookingSourceType | string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Payment method selector with automatic filtering based on booking source
 *
 * - Direct bookings (DirectStaff, DirectCustomer): Cash, Card, BankTransfer
 * - OTA/Agency bookings: OTAPrepaid, OTACollect, OnAccount
 *
 * @example
 * ```tsx
 * <PaymentMethodSelector
 *   value={paymentMethod}
 *   onValueChange={setPaymentMethod}
 *   bookingSource={booking.source}
 * />
 * ```
 */
export function PaymentMethodSelector({
  value,
  onValueChange,
  bookingSource,
  disabled = false,
  placeholder = "Chọn phương thức thanh toán",
  className,
}: PaymentMethodSelectorProps) {
  // Get allowed payment methods based on booking source
  const allowedMethods = getAvailablePaymentMethods(bookingSource);

  // Filter PAYMENT_METHODS to only show allowed ones
  const filteredMethods = PAYMENT_METHODS.filter(
    (method) => allowedMethods.includes(method.value) && !method.disabled
  );

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {filteredMethods.map((method) => (
          <SelectItem key={method.value} value={method.value}>
            {method.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
