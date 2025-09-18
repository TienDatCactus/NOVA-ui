import { withPrefix } from "~/lib/utils";

export const mapIds = {
  original: "map-original",
  trip: "map-trip",
};

export const ROUTES = {
  HOME: "/",
  AUTH: withPrefix("/auth", {
    LOGIN: "/login",
    LOGOUT: "/logout",
    REGISTER: "/register",
    REFRESH: "/refresh",
  }),
  USER: withPrefix("/user", {
    PROFILE: "/profile",
    SETTINGS: "/settings",
  }),
  TRIP: withPrefix("/trip", {
    CREATE: "/create",
    UPDATE: "/update",
    DELETE: "/delete",
    DETAILS: "/details",
  }),
};
