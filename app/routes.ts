import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home/home.tsx"),
  ...prefix("auth", [
    route("login", "routes/auth/login.tsx"),
    route("register", "routes/auth/register.tsx"),
  ]),
  layout("layouts/auth.layout.tsx", [
    ...prefix("trip", [
      layout("layouts/trip.layout.tsx", [
        index("routes/trip/trip.tsx"),
        route("new", "routes/trip/trip-create.tsx"),
        route(":tripId", "routes/trip/trip-detail.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
