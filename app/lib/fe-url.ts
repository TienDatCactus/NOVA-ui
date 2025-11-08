const AUTH = {
  login: "/auth/login",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
};

const DASHBOARD = {
  bookings: {
    index: "/dashboard/bookings",
    bookings: "/dashboard/bookings/bookings",
    bookingDetail: (bookingCode: string) =>
      `/dashboard/bookings/bookings/detail/${bookingCode}`,
    newBooking: "/dashboard/bookings/new-booking",
  },
  orders: {
    index: "/dashboard/orders",
    pos: "/dashboard/orders/pos",
  },
};
const CUSTOMER = {
  chat: "/customer/chat",
};
export { AUTH, DASHBOARD, CUSTOMER };
