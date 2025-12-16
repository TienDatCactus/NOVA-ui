import { Receipt, Wallet, CreditCard, Building2, Globe } from "lucide-react";
export const PAYMENT_METHODS = [
  { value: "Unknown", label: "Chưa xác định", icon: Receipt, disabled: true },
  { value: "Cash", label: "Tiền mặt", icon: Wallet },
  { value: "Card", label: "Thẻ", icon: CreditCard },
  { value: "BankTransfer", label: "Chuyển khoản", icon: Building2 },
  { value: "OTAPrepaid", label: "OTA trả trước", icon: Globe },
];

export const PAYMENT_STATUSES = [
  { key: "Unpaid", value: 0, label: "Chưa thanh toán" },
  { key: "DepositOnly", value: 1, label: "Đặt cọc" },
  { key: "PartiallyPaid", value: 2, label: "Thanh toán một phần" },
  { key: "Paid", value: 3, label: "Đã thanh toán" },
  { key: "Overpaid", value: 4, label: "Thanh toán dư" },
  { key: "Refunded", value: 5, label: "Đã hoàn tiền" },
  { key: "Chargeback", value: 6, label: "Bị hoàn tiền (chargeback)" },
  { key: "Voided", value: 7, label: "Đã hủy hóa đơn" },
];
