import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  ...prefix("auth", [
    route("login", "routes/auth/login.tsx"),
    route("forgot-password", "routes/auth/forgot-password.tsx"),
    route("verify-otp", "routes/auth/verify-otp.tsx"),
  ]),
  layout("layouts/auth.layout.tsx", [
    route("services", "routes/services/services.tsx"),
    route("dashboard", "layouts/dashboard.layout.tsx", [
      index("routes/dashboard/dashboard.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
