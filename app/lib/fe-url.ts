const AUTH = {
  login: "/auth/login",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
};

const DASHBOARD = {
  reservation: {
    index: "/dashboard/reservation",
    bookings: "/dashboard/reservation/bookings",
    bookingDetail: (bookingCode: string) =>
      `/dashboard/reservation/bookings/detail/${bookingCode}`,
  },
};
const CUSTOMER = {
  chat: "/customer/chat",
};
export { AUTH, DASHBOARD, CUSTOMER };
