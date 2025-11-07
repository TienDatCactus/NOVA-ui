// Invoice status mapping aligned with backend enum codes
// 0 Unpaid, 1 DepositOnly, 2 PartiallyPaid, 3 Paid, 4 Overpaid, 5 Refunded, 6 Chargeback, 7 Voided
export const INVOICE_STATUSES = [
  { code: 0, value: "Unpaid", label: "Chưa thanh toán", variant: "secondary" },
  { code: 1, value: "DepositOnly", label: "Đặt cọc", variant: "default" },
  {
    code: 2,
    value: "PartiallyPaid",
    label: "Thanh toán một phần",
    variant: "default",
  },
  { code: 3, value: "Paid", label: "Đã thanh toán", variant: "success" },
  { code: 4, value: "Overpaid", label: "Thanh toán dư", variant: "default" },
  { code: 5, value: "Refunded", label: "Đã hoàn tiền", variant: "secondary" },
  {
    code: 6,
    value: "Chargeback",
    label: "Hoàn trả (chargeback)",
    variant: "destructive",
  },
  { code: 7, value: "Voided", label: "Đã vô hiệu hóa", variant: "destructive" },
] as const;
