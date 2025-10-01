import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const withPrefix = (prefix: string, routes: Record<string, string>) => {
  return Object.fromEntries(
    Object.entries(routes).map(([key, path]) => [key, `${prefix}${path}`])
  ) as Record<keyof typeof routes, string>;
};
