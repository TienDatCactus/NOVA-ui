import type z from "zod";
import { FinancesSchema } from "./finances.schema";

// SME Simplified DTOs (2026-01-12)
export type SimpleTrendPointDto = z.infer<
  typeof FinancesSchema.SimpleTrendPointSchema
>;

export type RevenueStructureDto = z.infer<
  typeof FinancesSchema.RevenueStructureSchema
>;

export type FinancialDashboardSmeDto = z.infer<
  typeof FinancesSchema.FinancialDashboardSmeSchema
>;
