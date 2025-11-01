import { Receipt, Wallet, CreditCard, Building2, Globe } from "lucide-react";

export const PAYMENT_METHODS = [
  { value: "0", label: "Chưa xác định", icon: Receipt, disabled: true },
  { value: "1", label: "Tiền mặt", icon: Wallet },
  { value: "2", label: "Thẻ", icon: CreditCard },
  { value: "3", label: "Chuyển khoản", icon: Building2 },
  { value: "4", label: "OTA thu hộ", icon: Globe },
  { value: "5", label: "OTA trả trước", icon: Globe },
  { value: "6", label: "Ghi nợ", icon: Receipt },
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
