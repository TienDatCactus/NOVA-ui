// SME Simplified Request Parameters (2026-01-12)
// Removed: ComparisonType, TimeZone
// Changed: TrendDays default from 14 to 7
export type FinancialReportsListParams = {
  IncludeTrend?: boolean;
  TrendDays?: number; // Default: 7 (max)
  StartDate?: string; // ISO date string
  EndDate?: string; // ISO date string
  PeriodType?:
    | "Today"
    | "ThisWeek"
    | "ThisMonth"
    | "ThisQuarter"
    | "ThisYear"
    | "CustomRange";
};
