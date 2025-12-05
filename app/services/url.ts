import { de } from "date-fns/locale";

const Auth = {
  login: "Auth/login",
  logout: "Auth/logout",
  forgotPassword: "Auth/forgot-password",
  resetPassword: "Auth/reset-password",
  refresh: "Auth/refresh",
  revoke: "Auth/revoke",
};

const User = {
  list: "Users",
  detail: (id: string) => `Users/${id}`,
  create: "Users",
  update: (id: string) => `Users/${id}`,
  roles: "Users/roles",
  lock: (id: string) => `Users/${id}/lock`,
  unlock: (id: string) => `Users/${id}/unlock`,
  assignRoles: (id: string) => `Users/${id}/roles`,
  removeRoles: (id: string) => `Users/${id}/roles`,
  changePassword: (id: string) => `Users/${id}/change-password`,
  chatStaff: "Users/chat-staff",
  delete: (id: string) => `Users/${id}`,
};

const Booking = {
  staffCreateBooking: "StaffBookings",
  preview: "StaffBookings/preview",
  update: (id: string) => `StaffBookings/${id}`,
  cancel: (id: string) => `StaffBookings/${id}/cancel`,
  pendingCharges: (bookingId: string) =>
    `StaffBookings/${bookingId}/pending-charges`,
  createInvoice: (id: string) => `StaffBookings/${id}/checkout/create-invoice`,
  payment: (id: string) => `StaffBookings/${id}/checkout/payment`,
  checkout: (id: string) => `StaffBookings/${id}/checkout`,
  checkoutMultiple: "StaffBookings/checkout-multiple",
  changeRoom: (bookingId: string, bookingRoomId: string) =>
    `StaffBookings/${bookingId}/rooms/${bookingRoomId}/available-for-change`,
  list: "Bookings/list",
  listByWeek: "Bookings/rooms-week",
  detailById: (id: string) => `Bookings/${id}/details`,
  detailByCode: (code: string) => `Bookings/by-code/${code}/details`,
  Export: `Bookings/export`,
  updateStatus: "Bookings/update-status",
  addToCompletedRoomOrder: (bookingId: string) =>
    `/StaffBookings/${bookingId}/add-completed-charges`,
  confirmPayment: (id: string) => `StaffBookings/${id}/confirm-payment`,
  orderableBookings: "StaffBookings/orderable",
  payForRoom: (id: string) => `StaffBookings/${id}/pay-now-rooms`,
  upgradeRoom: (id: string) => `StaffBookings/${id}/upgrade-room`,
};

const OTAInformation = {
  list: "OTAInformation/list",
};
const Rooms = {
  availables: "Rooms/available",
  detail: (id: string) => `Rooms/${id}/details`,
  bookingHistory: (id: string) => `Rooms/${id}/booking-history`,
  updateStatus: "Rooms/update-status",
  list: "Rooms/list",
  create: "Rooms",
  update: (id: string) => `Rooms/${id}`,
  getAvailableRoomsInternal: "Rooms/available-with-details",

  delete: (id: string) => `Rooms/${id}`,
  generateQRCode: (id: string, baseUrl?: string) =>
    `Rooms/${id}/qr-code?baseUrl=${baseUrl}`,
  regenerateQRCode: (id: string, baseUrl?: string) =>
    baseUrl
      ? `Rooms/${id}/qr-code/regenerate?baseUrl=${baseUrl}`
      : `Rooms/${id}/qr-code/regenerate`,
};

const RoomTypes = {
  list: "RoomTypes/list",
  detail: (id: string) => `RoomTypes/${id}`,
  update: (id: string) => `RoomTypes/${id}`,
  create: "RoomTypes",
  delete: (id: string) => `RoomTypes/${id}`,
};
const MenuCategory = {
  list: "menu-categories",
  detail: (id: string) => `menu-categories/${id}`,
  create: "menu-categories",
  update: (id: string) => `menu-categories/${id}`,
  delete: (id: string) => `menu-categories/${id}`,
};

const Menu = {
  list: "Menu/list",
  detail: (id: string) => `Menu/items/${id}`,
  create: "Menu/items",
  update: (id: string) => `Menu/items/${id}`,
  delete: (id: string) => `Menu/items/${id}`,
  listByCategory: (categoryId: string) =>
    `Menu/items/by-category/${categoryId}`,
};

const Service = {
  list: "/Service/list",
  detail: (id: string) => `Service/items/${id}`,
  byServiceType: (serviceTypeId: string) =>
    `Service/items/by-service-type/${serviceTypeId}`,
  create: "Service/items",
  update: (id: string) => `Service/items/${id}`,
  delete: (id: string) => `Service/items/${id}`,
};

const ServiceTypes = {
  list: "ServiceTypes",
  create: "ServiceTypes",
  update: (id: string) => `ServiceTypes/${id}`,
  detail: (id: string) => `ServiceTypes/${id}`,
  delete: (id: string) => `ServiceTypes/${id}`,
};

const Units = {
  list: "Units",
  create: "Units",
  detail: (id: string) => `Units/${id}`,
  update: (id: string) => `Units/${id}`,
  delete: (id: string) => `Units/${id}`,
};

const Reports = {
  reservationReports: (fromDate: string, toDate: string) =>
    `Reports/daily-booking-dashboard?fromDate=${fromDate}&toDate=${toDate}`,
};

const Orders = {
  createPosOrder: "PosOrders",
  addItemsToPos: (id: string) => `PosOrders/${id}/items`,
  addBatchItemsToPos: (id: string) => `PosOrders/${id}/items/batch`,
  deleteItemFromPos: (orderId: string, itemId: string) =>
    `PosOrders/${orderId}/items/${itemId}`,
  cancelPosOrder: (id: string) => `PosOrders/${id}/cancel`,
  completePosOrder: (id: string) => `PosOrders/${id}/complete`,
  listPosOrders: `PosOrders/list`,
  detailPOS: (id: string) => `PosOrders/${id}`,
  printPOSorder: (id: string) => `PosOrders/${id}/print-data`,
  payNow: (id: string) => `PosOrders/${id}/pay-now`,
  setServed: (id: string, itemId: string) =>
    `PosOrders/${id}/items/${itemId}/set-served`,
  setScheduled: (id: string) => `PosOrders/${id}/set-scheduled`,
  updateNote: (id: string) => `PosOrders/${id}/update-note`,
  // Service Orders
  createServiceOrder: "service-orders",
  updateServiceOrder: (id: string) => `service-orders/${id}`,
  detailServiceOrder: (id: string) => `service-orders/${id}`,
  completeServiceOrder: (id: string) => `service-orders/${id}/complete`,
  cancelServiceOrder: (id: string) => `service-orders/${id}/cancel`,
  listServiceOrders: `service-orders/list`,
  payServiceOrderNow: (id: string) => `service-orders/${id}/pay-now`,
  setScheduledServiceOrder: (id: string) =>
    `service-orders/${id}/set-scheduled`,
  createPosOrderWithItems: "PosOrders/with-items",
};

const Invoices = {
  list: "Invoices", //? get list of invoices with pagination and filters
  create: "Invoices", //? create invoice for a room booking
  addItems: (id: string) => `Invoices/${id}/items`, //? add items to invoice
  addCustomItems: (id: string) => `Invoices/${id}/custom-items`, //? add custom items to invoice
  markPaid: (id: string) => `Invoices/${id}/mark-paid`, //? mark invoice as paid
  void: (id: string) => `Invoices/${id}/void`, //? void invoice
  detail: (id: string) => `Invoices/${id}`, //? get invoice details
  listByBooking: (bookingId: string) => `Invoices/booking/${bookingId}`, //? list invoices by booking ID
  calculateFees: "invoice-preview/calculate-fees",
  previewBookingInvoice: "invoice-preview/preview",
  payments: (id: string) => `Invoices/${id}/payments`, //? get invoice payments
  refund: (id: string) => `Invoices/${id}/refund`, //? refund invoice
  export: (date?: string) =>
    date ? `Invoices/export?date=${date}` : `Invoices/export`, //? export invoices
  update: (id: string) => `Invoices/${id}`, //? update invoice details
  syncInvoice: (invoiceId: string) =>
    `Invoices/${invoiceId}/sync-pending-orders`, //? sync invoice with pending orders
  exportById: (id: string) => `Invoices/${id}/export`, //? export invoice by ID
};
// Chat endpoints
const Chat = {
  entry: (roomToken: string) => `chat/entry?roomToken=${roomToken}`,
  messages: (sessionId: string) => `chat/sessions/${sessionId}/messages`,
  session: (sessionId: string) => `chat/sessions/${sessionId}`,
  sendMessage: "chat/messages",
  staffInbox: "chat/staff/inbox",
  assign: (sessionId: string) => `chat/sessions/${sessionId}/assign`,
  close: (sessionId: string) => `chat/sessions/${sessionId}/close`,
  markRead: (messageId: string) => `chat/messages/${messageId}/mark-read`,
  markAllRead: (sessionId: string) =>
    `chat/sessions/${sessionId}/mark-all-read`,
};

const Staff = {
  list: "Staffs",
  create: "Staffs",
  detail: (id: string) => `Staffs/${id}`,
  update: (id: string) => `Staffs/${id}`,
  delete: (id: string) => `Staffs/${id}`,
  terminate: (id: string) => `Staffs/${id}/terminate`,
};

const StaffRole = {
  list: "StaffRoles",
  create: "StaffRoles",
  detail: (id: string) => `StaffRoles/${id}`,
  update: (id: string) => `StaffRoles/${id}`,
  delete: (id: string) => `StaffRoles/${id}`,
};

const WorkShift = {
  list: "WorkShifts",
  active: "WorkShifts/active",
  create: "WorkShifts",
  detail: (id: string) => `WorkShifts/${id}`,
  update: (id: string) => `WorkShifts/${id}`,
  delete: (id: string) => `WorkShifts/${id}`,
};

const Holiday = {
  list: "Holidays",
  create: "Holidays",
  detail: (id: string) => `Holidays/${id}`,
  update: (id: string) => `Holidays/${id}`,
  delete: (id: string) => `Holidays/${id}`,
};

const StaffShift = {
  list: "StaffShifts",
  schedule: "StaffShifts/schedule",
  detail: (id: string) => `StaffShifts/${id}`,
  update: (id: string) => `StaffShifts/${id}/schedule`,
  delete: (id: string) => `StaffShifts/${id}`,
  exportWeeklyMatrix: "StaffShifts/export-weekly-matrix",
  exportWeeklyForm2: "StaffShifts/export-weekly-form2",
};

const StaffAttendance = {
  list: "StaffShifts/attendance",
  absent: (assignmentId: string) => `StaffShifts/${assignmentId}/absent`,
  present: (assignmentId: string) => `StaffShifts/${assignmentId}/present`,
};

const Discount = {
  apply: "discount/apply",
  override: "discount/override",
};

const StaffPayroll = {
  grid: "StaffPayrolls/grid",
  generate: "StaffPayrolls/generate",
  detail: (id: string) => `StaffPayrolls/${id}`,
  update: (id: string) => `StaffPayrolls/${id}`,
  generateSingle: (staffId: string) =>
    `StaffPayrolls/staff/${staffId}/generate`,
  applyUnusedLeave: (id: string) => `StaffPayrolls/${id}/apply-unused-leave`,
  lock: (id: string) => `StaffPayrolls/${id}/lock`,
  unlock: (id: string) => `StaffPayrolls/${id}/unlock`,
  getComponents: (id: string) => `StaffPayrolls/${id}/components`,
  addComponent: (id: string) => `StaffPayrolls/${id}/components`,
  updateComponent: (componentId: string) =>
    `StaffPayrolls/components/${componentId}`,
  deleteComponent: (componentId: string) =>
    `StaffPayrolls/components/${componentId}`,
  exportMonthly: "StaffPayrolls/export/monthly",
  exportPayslip: (id: string) => `StaffPayrolls/${id}/export-payslip`,
  refreshDays: "StaffPayrolls/refresh-days",
  refreshSinglePayroll: (id: string) => `StaffPayrolls/${id}/refresh-days`,
  createSalaryExpense: (payrollId: string) =>
    `StaffPayrolls/${payrollId}/create-salary-expense`,
};

const Translation = {
  translate: "Translation/translate",
  detect: (text: string) => `Translation/detect-language?text=${text}`,
};

const Stock = {
  Items: {
    list: "Items",
    create: "Items",
    detail: (id: string) => `Items/${id}`,
    update: (id: string) => `Items/${id}`,
    delete: (id: string) => `Items/${id}`,
    listByCategory: (categoryId: string) => `Items/by-category/${categoryId}`,
    listByCode: (code: string) => `Items/by-code/${code}`,
    lowStock: "Items/low-stock",
    transactions: (id: string) => `Items/${id}/transactions`,
    adjustStock: (id: string) => `Items/${id}/adjust-stock`,
  },
  PurchaseRequests: {
    list: "PurchaseRequests",
    create: "PurchaseRequests",
    detail: (id: string) => `PurchaseRequests/${id}`,
    update: (id: string) => `PurchaseRequests/${id}`,
    delete: (id: string) => `PurchaseRequests/${id}`,
    approve: (id: string) => `PurchaseRequests/${id}/approve`,
    reject: (id: string) => `PurchaseRequests/${id}/reject`,
    cancel: (id: string) => `PurchaseRequests/${id}/cancel`,
    receiveStock: (id: string) => `PurchaseRequests/${id}/receive-stock`,
    export: (id: string) => `PurchaseRequests/${id}/export`,
  },
  StockAdjustments: {
    list: "StockAdjustments",
    create: "StockAdjustments",
    detail: (id: string) => `StockAdjustments/${id}`,
    update: (id: string) => `StockAdjustments/${id}`,
    delete: (id: string) => `StockAdjustments/${id}`,
    apply: (id: string) => `StockAdjustments/${id}/apply`,
  },
  ItemCategories: {
    list: "ItemCategories",
    create: "ItemCategories",
    detail: (id: string) => `ItemCategories/${id}`,
    update: (id: string) => `ItemCategories/${id}`,
    delete: (id: string) => `ItemCategories/${id}`,
  },
};

const Refunds = {
  createRefundForBooking: (bookingId: string) => `Refunds/booking/${bookingId}`,
  getBookingRefundHistory: (bookingId: string) =>
    `Refunds/booking/${bookingId}/history`,
};

const FinancialReports = {
  getFinancialReport: "FinancialReports/dashboard",
  getFinancialReportCached: "FinancialReports/dashboard/cached",
};

const Expenses = {
  list: "Expenses",
  create: "Expenses",
  detail: (id: string) => `Expenses/${id}`,
  update: (id: string) => `Expenses/${id}`,
  delete: (id: string) => `Expenses/${id}`,
  summary: "Expenses/summary",
  post: (id: string) => `Expenses/${id}/post`,
  void: (id: string) => `Expenses/${id}/void`,
};

const AuditLogs = {
  list: "AuditLogs",
  detail: (id: string) => `AuditLogs/${id}`,
  export: "AuditLogs/export",
  archive: "AuditLogs/archive",
  cleanUp: "AuditLogs/cleanup",
  cleanUpCount: "AuditLogs/cleanup-count",
  stats: "AuditLogs/stats",
};

const Configs = {
  list: "Configs",
  groupedList: "Configs/grouped",
  timezones: "Configs/timezones",
  detail: (key: string) => `Configs/${key}`,
  update: (key: string) => `Configs/${key}`,
  delete: (key: string) => `Configs/${key}`,
};
export {
  Auth,
  User,
  Booking,
  MenuCategory,
  Menu,
  Service,
  Rooms,
  RoomTypes,
  OTAInformation,
  ServiceTypes,
  Units,
  Reports,
  Orders,
  Invoices,
  Staff,
  StaffRole,
  WorkShift,
  Holiday,
  StaffShift,
  StaffAttendance,
  Chat,
  Discount,
  StaffPayroll,
  Translation,
  Stock,
  Refunds,
  Expenses,
  FinancialReports,
  AuditLogs,
  Configs,
};
