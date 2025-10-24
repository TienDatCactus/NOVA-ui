import { useLocation } from "react-router";
import { TOP_NAV_CONFIG } from "~/lib/constants";

export function useHeaderNav() {
  const location = useLocation();

  const matchedPrefix = Object.keys(TOP_NAV_CONFIG).find((prefix) =>
    location.pathname.includes(prefix)
  );

  const currentNavItems = matchedPrefix
    ? TOP_NAV_CONFIG[matchedPrefix as keyof typeof TOP_NAV_CONFIG]
    : [];

  return { navItems: currentNavItems, currentPath: location.pathname };
}
