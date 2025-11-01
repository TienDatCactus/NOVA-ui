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

const MenuItem = {
  list: "Menu/list",
  detail: (id: string) => `Menu/items/${id}`,
  create: "Menu/items",
  update: (id: string) => `Menu/items/${id}`,
  delete: (id: string) => `Menu/items/${id}`,
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
  reservationReports: (date: string) =>
    `Reports/daily-booking-dashboard?date=${date}`,
};
export {
  Auth,
  Booking,
  MenuCategory,
  MenuItem,
  Service,
  Rooms,
  RoomTypes,
  OTAInformation,
  ServiceTypes,
  Units,
  Reports,
};
