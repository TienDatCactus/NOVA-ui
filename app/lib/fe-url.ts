const AUTH = {
  login: "/auth/login",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
};

const DASHBOARD = {
  bookings: {
    reports: "/dashboard/bookings/reports",
    list: "/dashboard/bookings/list",
    bookingDetail: (bookingCode: string) =>
      `/dashboard/bookings/detail/${bookingCode}`,
    newBooking: "/dashboard/bookings/new-booking",
  },
  orders: {
    "service-pos": "/dashboard/orders/service-pos",
    "service-orders": "/dashboard/orders/service-orders",
    "menu-pos": "/dashboard/orders/menu-pos",
    "menu-orders": "/dashboard/orders/menu-orders",
  },
};
const CUSTOMER = {
  chat: "/customer/chat",
};
export { AUTH, DASHBOARD, CUSTOMER };
