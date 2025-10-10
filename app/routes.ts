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
        route("bookings", "routes/reservation/bookings/bookings.tsx"),
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
