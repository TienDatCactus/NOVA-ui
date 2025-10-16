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
  layout("layouts/dashboard.layout.tsx", [
    ...prefix("dashboard", [
      ...prefix("reservation", [
        index("routes/reservation/reservation.tsx"),
        ...prefix("bookings", [
          route("grid", "routes/reservation/bookings/grid.tsx"),
          route("list", "routes/reservation/bookings/list.tsx"),
          route("timeline", "routes/reservation/bookings/timeline.tsx"),
        ]),
        route("invoices", "routes/reservation/invoices/invoices.tsx"),
      ]),
      route("rooms", "routes/rooms/rooms.tsx"),
      route("services", "routes/services/services.tsx"),
      route("invoices", "routes/invoices/invoices.tsx"),
      route("customers", "routes/customers/customers.tsx"),
    ]),
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
