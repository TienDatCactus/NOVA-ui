const AUTH = {
  login: "/auth/login",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
};

const DASHBOARD = {
  bookings: {
    reports: "/dashboard/bookings/reports",
    grid: "/dashboard/bookings/grid",
    list: "/dashboard/bookings/list",
    invoices: "/dashboard/bookings/invoices",
    bookingDetail: (bookingCode: string) =>
      `/dashboard/bookings/detail/${bookingCode}`,
    newBooking: "/dashboard/bookings/new-booking",
  },
  rooms: {
    list: "/dashboard/rooms",
    types: "/dashboard/rooms/types",
  },
  services: {
    list: "/dashboard/services",
    types: "/dashboard/services/types",
    menu: "/dashboard/services/menu",
    menuCategories: "/dashboard/services/menu-categories",
  },
  orders: {
    menuOrders: "/dashboard/orders/menu-orders",
    serviceOrders: "/dashboard/orders/service-orders",
    menuPos: "/dashboard/menu-pos",
    servicePos: "/dashboard/service-pos",
  },
  staff: {
    list: "/dashboard/staff",
    workShifts: "/dashboard/staff/work-shifts",
    schedules: "/dashboard/staff/schedules",
    holidays: "/dashboard/staff/holidays",
  },
  users: "/dashboard/users",
  invoices: "/dashboard/invoices",
  chat: "/dashboard/chat",
  units: "/dashboard/units",
  stocks: {
    items: "/dashboard/stocks/items",
    itemCategories: "/dashboard/stocks/item-categories",
    purchaseRequests: "/dashboard/stocks/purchase-requests",
    adjustments: "/dashboard/stocks/stock-adjustments",
  },
  settings: "/settings",
  help: "/help",
};
const CUSTOMER = {
  inbox: "/",
  chat: (roomToken: string) => `/chat?roomToken=${roomToken}`,
  map: "/map",
};

const FE_URL = {
  auth: AUTH,
  dashboard: DASHBOARD,
  customer: CUSTOMER,
} as const;

export { AUTH, DASHBOARD, CUSTOMER, FE_URL };
export default FE_URL;
