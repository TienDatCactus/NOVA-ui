import z from "zod";

// SME Simplified Schemas (2026-01-12)
// Reduced from 50+ fields to 12 fields for SME hotel owners

const SimpleTrendPointSchema = z.object({
  date: z.string(),
  revenue: z.number(),
  expense: z.number(),
});

const RevenueStructureSchema = z.object({
  category: z.string(), // "Room Revenue" or "F&B & Services"
  amount: z.number(),
  percentage: z.number(),
});

const FinancialDashboardSmeSchema = z.object({
  // CARD 1: Cash Flow (3 fields)
  totalCollected: z.number(),
  totalSpent: z.number(),
  netCash: z.number(),

  // CARD 2: Debts (1 field)
  otaReceivable: z.number(),

  // CARD 3: Operations (2 fields)
  occupancyPercent: z.number(),
  averageDailyRate: z.number(),

  // CARD 4: Alerts (2 fields)
  lowStockItems: z.array(z.string()),
  arrivalsToday: z.number(),

  // CHART 1: Trend (1 field)
  revenueTrend: z.array(SimpleTrendPointSchema),

  // CHART 2: Structure (1 field)
  revenueStructure: z.array(RevenueStructureSchema),

  // Metadata (2 fields)
  generatedAt: z.string(),
  periodDescription: z.string(),
});

export const FinancesSchema = {
  SimpleTrendPointSchema,
  RevenueStructureSchema,
  FinancialDashboardSmeSchema,
};
