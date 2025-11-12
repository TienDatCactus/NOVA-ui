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
};

const Booking = {
  staffCreateBooking: "StaffBookings",
  preview: "StaffBookings/preview", // this is for the money calculation preview
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
  addToCompletedRoomOrder: (bookingId: string) =>
    `/StaffBookings/${bookingId}/add-completed-charges`,
};

const OTAInformation = {
  list: "OTAInformation/list",
};
const Rooms = {
  detail: (id: string) => `Rooms/${id}/details`,
  bookingHistory: (id: string) => `Rooms/${id}/booking-history`,
  updateStatus: "Rooms/update-status",
  list: "Rooms/list",
  create: "Rooms",
  update: (id: string) => `Rooms/${id}`,
  getAvailableRoomsInternal: "Rooms/available-with-details",
  delete: (id: string) => `Rooms/${id}`,
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
};

const Invoices = {
  list: "Invoices", //? get list of invoices with pagination and filters
  create: "Invoices", //? create invoice for a room booking
  addItems: (id: string) => `Invoices/${id}/items`, //? add items to invoice
  addCustomItems: (id: string) => `Invoices/${id}/custom-items`, //? add custom items to invoice
  markPaid: (id: string) => `Invoices/${id}/mark-paid`, //? mark invoice as paid
  void: (id: string) => `Invoices/${id}/void`, //? void invoice
  detail: (id: string) => `Invoices/${id}`, //? get invoice details
  listByBooking: (bookingRoomId: string) =>
    `Invoices/booking-room/${bookingRoomId}`, //? list invoices by booking ID
  calculateFees: "invoice-preview/calculate-fees",
  previewBookingInvoice: "invoice-preview/preview",
};

const Staff = {
  list: "Staffs",
  create: "Staffs",
  detail: (id: string) => `Staffs/${id}`,
  update: (id: string) => `Staffs/${id}`,
  delete: (id: string) => `Staffs/${id}`,
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
};
