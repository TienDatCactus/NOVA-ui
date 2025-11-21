/**
 * Format number with thousand separators using comma
 * @param value - String or number to format
 * @returns Formatted string with commas (e.g., "1,000,000")
 */
export function formatNumber(value: string | number): string {
  const numStr = typeof value === "number" ? value.toString() : value;
  const num = numStr.replace(/[^\d]/g, ""); // Remove all non-digits
  if (!num || isNaN(Number(num))) return "";
  return Number(num).toLocaleString("en-US");
}

/**
 * Parse formatted number string back to plain number
 * @param value - Formatted string with separators
 * @returns Plain number without separators
 */
export function parseFormattedNumber(value: string): number {
  return parseFloat(value.replace(/[^\d]/g, "")) || 0;
}

/**
 * Handle input change for number input with thousand separators
 * @param e - React change event
 * @param setValue - State setter function
 */
export function handleNumberInputChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setValue: (value: string) => void
) {
  const value = e.target.value.replace(/[^\d]/g, "");
  setValue(value ? formatNumber(value) : "");
}
