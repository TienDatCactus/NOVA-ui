import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/auth.layout.tsx", [
    ...prefix("auth", [
      route("login", "routes/auth/login.tsx"),
      route("forgot-password", "routes/auth/forgot-password.tsx"),
      route("reset-password", "routes/auth/reset-password.tsx"),
    ]),
  ]),
  route("colors", "components/color-showcase.tsx"),
  ...prefix("dashboard", [
    route("menu-pos", "routes/orders/menu-pos.tsx"),
    route("service-pos", "routes/orders/service-pos.tsx"),
  ]),
  layout("layouts/dashboard.layout.tsx", [
    ...prefix("dashboard", [
      ...prefix("services", [
        index("routes/services/services.tsx"),
        route("types", "routes/services/types.tsx"),
        route("menu", "routes/menu/menu.tsx"),
        route("menu-categories", "routes/menu/menu-categories.tsx"),
      ]),
      ...prefix("bookings", [
        route("list", "routes/reservation/bookings/list.tsx"),
        route("reports", "routes/reservation/reports/reports.tsx"),
        route("grid", "routes/reservation/bookings/grid.tsx"),
        route(
          "detail/:bookingCode",
          "routes/reservation/booking-detail/booking-detail.tsx"
        ),
        route("new-booking", "routes/reservation/new-booking.tsx"),
      ]),
      ...prefix("orders", [
        route("menu-orders", "routes/orders/menu-orders.tsx"),
        route("service-orders", "routes/orders/service-orders.tsx"),
      ]),
      ...prefix("rooms", [
        index("routes/rooms/rooms.tsx"),
        route("types", "routes/rooms/types.tsx"),
      ]),
      route("units", "routes/units/units.tsx"),
      route("invoices", "routes/invoices/invoices.tsx"),
      route("expenses", "routes/expenses/expenses.tsx"),
      ...prefix("expenses", [
        route("dashboard", "routes/expenses/dashboard/dashboard.tsx"),
      ]),
      route("chat", "routes/chat/chat.tsx"),
      route("users", "routes/users/users.tsx"),
      route("work-shifts", "routes/work-shifts/work-shifts.tsx"),
      ...prefix("stocks", [
        ...prefix("items", [index("routes/stocks/items/items.tsx")]),
        ...prefix("item-categories", [
          index("routes/stocks/item-categories/item-categories.tsx"),
        ]),
        ...prefix("purchase-requests", [
          index("routes/stocks/purchase-requests/purchase-requests.tsx"),
        ]),
        ...prefix("stock-adjustments", [
          index("routes/stocks/stock-adjustments/stock-adjustments.tsx"),
        ]),
      ]),
      ...prefix("staff", [
        index("routes/staff/staff/staff.tsx"),

        route("holidays", "routes/staff/holidays/holidays.tsx"),
        route("schedules", "routes/staff/schedules/schedules.tsx"),
        route("payrolls", "routes/staff/payrolls/payrolls.tsx"),
        route("roles", "routes/staff/staff-role/staff-role.tsx"),
      ]),
    ]),
  ]),
  layout("layouts/customer.layout.tsx", [
    index("routes/customer/chat/inbox.tsx"),
    route("chat", "routes/customer/chat/chat.tsx"),
    route("map", "routes/customer/map/map.tsx"),
    route("guidelines", "routes/customer/guides/guides.tsx"),
  ]),

  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
