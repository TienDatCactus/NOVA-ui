import { clsx, type ClassValue } from "clsx";
import {
  Building2,
  Earth,
  House,
  Landmark,
  Layers,
  Mail,
  Map,
  MapPinHouse,
  MountainSnow,
  ScanSearch,
  ShieldUser,
  TrafficCone,
  Users,
  Warehouse,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const withPrefix = (prefix: string, routes: Record<string, string>) => {
  return Object.fromEntries(
    Object.entries(routes).map(([key, path]) => [key, `${prefix}${path}`])
  ) as Record<keyof typeof routes, string>;
};

export const layerIcon = (
  layer: string,
  className?: string
): React.ReactNode => {
  switch (layer) {
    case "venue":
    case "poi":
      return <MapPinHouse className={className} />;
    case "address":
      return <House className={className} />;

    case "street":
      return <TrafficCone className={className} />;

    case "country":
      return <Earth className={className} />;

    case "macroregion":
      return <Map className={className} />;

    case "region":
      return <MountainSnow className={className} />;

    case "macrocounty":
      return <Layers className={className} />;

    case "county":
      return <Landmark className={className} />;

    case "locality":
      return <Building2 className={className} />;

    case "localadmin":
      return <ShieldUser className={className} />;

    case "borough":
      return <Warehouse className={className} />;

    case "neighbourhood":
      return <Users className={className} />;

    case "postalcode":
      return <Mail className={className} />;

    case "coarse":
      return <ScanSearch className={className} />;

    default:
      break;
  }
};
