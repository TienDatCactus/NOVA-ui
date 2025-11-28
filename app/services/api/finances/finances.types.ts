export type FinancialReportsListParams = {
  IncludeTrend?: boolean;
  TrendDays?: number;
  StartDate?: string; // ISO date string
  EndDate?: string; // ISO date string
  PeriodType?:
    | "Today"
    | "ThisWeek"
    | "ThisMonth"
    | "ThisQuarter"
    | "ThisYear"
    | "CustomRange";
  ComparisonType?: "None" | "PreviousPeriod" | "SamePeriodLastYear" | "Budget";
  TimeZone?: string;
};
