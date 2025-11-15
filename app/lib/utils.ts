import { clsx, type ClassValue } from "clsx";
import { differenceInDays, format, parseISO } from "date-fns";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const withPrefix = (prefix: string, routes: Record<string, string>) => {
  return Object.fromEntries(
    Object.entries(routes).map(([key, path]) => [key, `${prefix}${path}`])
  ) as Record<keyof typeof routes, string>;
};

export function parseDateYMD(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function startOfLocalDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
export function addDays(d: Date, n: number) {
  const nd = new Date(d);
  nd.setDate(d.getDate() + n);
  return nd;
}
export function daysBetweenFloor(a: Date, b: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
}

export function formatMoney(amount: number | bigint | string) {
  if (!amount) {
    return {
      usdFormatted: "$0",
      vndFormatted: "0 ₫",
    };
  }
  const amountStr = amount.toString();
  const formattedBase = amountStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Append currency symbols manually
  const usdFormatted = `$${formattedBase}`;
  const vndFormatted = `${formattedBase} ₫`;

  return { usdFormatted, vndFormatted };
}

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const stripHtml = (html: string) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export function useCalculateNights({
  checkinDate,
  checkoutDate,
}: {
  checkinDate?: string | Date;
  checkoutDate?: string | Date;
}) {
  if (!checkinDate || !checkoutDate) return 0;
  return differenceInDays(checkoutDate, checkinDate);
}

export const onError = (errors: any) => {
  toast.error("Vui lòng kiểm tra lại thông tin đã nhập", errors);
  console.log("Validation errors:", errors);
};

export const toYMD = (d: unknown) => {
  if (d instanceof Date) return format(d, "yyyy-MM-dd");
  if (typeof d === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const dt = parseISO(d);
    if (!isNaN(dt.getTime())) return format(dt, "yyyy-MM-dd");
  }
  return undefined;
};
