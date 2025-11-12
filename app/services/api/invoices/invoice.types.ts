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

// Payment method mapping
export const PAYMENT_METHODS = [
  { value: "Unknown", label: "Chưa xác định" },
  { value: "Cash", label: "Tiền mặt" },
  { value: "Card", label: "Thẻ" },
  { value: "BankTransfer", label: "Chuyển khoản" },
  { value: "OTACollect", label: "OTA thu hộ" },
  { value: "OTAPrepaid", label: "OTA trả trước" },
  { value: "OnAccount", label: "Ghi nợ" },
] as const;

// Invoice item type mapping (aligned with InvoiceItemType enum)
// Room = 1, MenuItem = 2, ServiceItem = 3, Custom = 4
export const INVOICE_ITEM_TYPES = [
  { code: 1, value: "Room", label: "Phòng" },
  { code: 2, value: "MenuItem", label: "Món ăn/Đồ uống" },
  { code: 3, value: "ServiceItem", label: "Dịch vụ" },
  { code: 4, value: "Custom", label: "Tùy chỉnh" },
] as const;

// Request params types
export interface InvoiceListParams {
  Page?: number;
  PageSize?: number;
  SortBy?: string;
  SortDirection?: string;
  Status?: string; // Unpaid, DepositOnly, PartiallyPaid, Paid, Overpaid, Refunded, Chargeback, Voided
  PaymentMethod?: string; // Unknown, Cash, Card, BankTransfer, OTACollect, OTAPrepaid, OnAccount
  BookingId?: string; // Select from booking list
  BookingCode?: string; // Select from booking list
  Keyword?: string;
  IssuedFrom?: string; // date-time string
  IssuedTo?: string; // date-time string
  InvoiceType?: string; // Room, MenuItem, ServiceItem, Custom (from InvoiceItemType enum)
}
