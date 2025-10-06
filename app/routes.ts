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
      route("verify-otp", "routes/auth/verify-otp.tsx"),
    ]),
  ]),
  layout("layouts/dashboard.layout.tsx", [
    ...prefix("dashboard", [
      index("routes/dashboard/dashboard.tsx"),
      route("reservation", "routes/reservation/reservation.tsx"),
      route("rooms", "routes/rooms/rooms.tsx"),
      route("services", "routes/services/services.tsx"),
      route("invoices", "routes/invoices/invoices.tsx"),
      route("customers", "routes/customers/customers.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
