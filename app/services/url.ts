const Auth = {
  login: "Auth/login",
  logout: "Auth/logout",
  forgotPassword: "Auth/forgot-password",
  resetPassword: "Auth/reset-password",
};

const Booking = {
  create: "Bookings",
  get: "Bookings",
  list: "Bookings/list",
  detail: (id: string) => `Bookings/${id}`,
  update: (id: string) => `Bookings/${id}`,
  delete: (id: string) => `Bookings/${id}`,
};

export { Auth, Booking };
