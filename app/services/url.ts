const Auth = {
  login: "Auth/login",
  logout: "Auth/logout",
  forgotPassword: "Auth/forgot-password",
  resetPassword: "Auth/reset-password",
  refresh: "Auth/refresh",
  revoke: "Auth/revoke",
};

const Booking = {
  staffCreateBooking: "StaffBookings",
  preview: "StaffBookings/preview", // this is for the money calculation preview
  update: (id: string) => `StaffBookings/${id}`,
  cancel: (id: string) => `StaffBookings/${id}/cancel`,
  list: "Bookings/list",
  listByWeek: "Bookings/rooms-week",
  detailById: (id: string) => `Bookings/${id}/details`,
  detailByCode: (code: string) => `Bookings/by-code/${code}/details`,
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
  createPOS: "PosOrders",
  addItemsToPOS: (id: string) => `PosOrders/${id}/items`,
  deleteItemFromPOS: (orderId: string, itemId: string) =>
    `PosOrders/${orderId}/items/${itemId}`,
  cancelPOSOrder: (id: string) => `PosOrders/${id}/cancel`,
  completePOSOrder: (id: string) => `PosOrders/${id}/complete`,
  detailPOS: (id: string) => `PosOrders/${id}/details`,
  listPOSbyInvoice: (invoiceId: string) => `PosOrders/invoice/${invoiceId}`,
  printPOSorder: (id: string) => `PosOrders/${id}/print-data`,
};

const Invoices = {
  create: "Invoices", //? create invoice for a room booking
  addItems: (id: string) => `Invoices/${id}/items`, //? add items to invoice
  addCustomItems: (id: string) => `Invoices/${id}/custom-items`, //? add custom items to invoice
  markPaid: (id: string) => `Invoices/${id}/mark-paid`, //? mark invoice as paid
  void: (id: string) => `Invoices/${id}/void`, //? void invoice
  detail: (id: string) => `Invoices/${id}`, //? get invoice details
  listByBooking: (bookingRoomId: string) =>
    `Invoices/booking-room/${bookingRoomId}`, //? list invoices by booking ID
};
export {
  Auth,
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
};
