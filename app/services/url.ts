const Auth = {
  login: "Auth/login",
  logout: "Auth/logout",
  forgotPassword: "Auth/forgot-password",
  resetPassword: "Auth/reset-password",
  refresh: "Auth/refresh",
  revoke: "Auth/revoke",
};

const Booking = {
  create: "Bookings",
  list: "Bookings/list",
  listByWeek: "Bookings/rooms-week",
  detail: (code: string) => `Bookings/${code}`,
};

const Rooms = {
  detail: (id: string) => `Rooms/${id}/details`,
  updateStatus: "Rooms/update-status",
};
const Menu = {
  list: "Menu/list",
};

const Service = {
  list: "Service/list",
};
export { Auth, Booking, Menu, Service, Rooms };
