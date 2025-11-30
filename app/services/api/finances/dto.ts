import type z from "zod";
import { FinancesSchema } from "./finances.schema";

export type KpisBaseDto = z.infer<typeof FinancesSchema.KpisBaseSchema>;

export type RevenueBreakItemType = z.infer<
  typeof FinancesSchema.RevenueBreakItemTypeEnum
>;

export type RevenueBreakdownItemDto = z.infer<
  typeof FinancesSchema.RevenueBreakdownItemSchema
>;

export type ChannelRevenueDto = z.infer<
  typeof FinancesSchema.ChannelRevenueSchema
>;

export type BookingMetricsDto = z.infer<
  typeof FinancesSchema.BookingMetricsSchema
>;

export type RevenueTrendDto = z.infer<typeof FinancesSchema.RevenueTrendSchema>;

export type FinancialHealthDto = z.infer<
  typeof FinancesSchema.FinancialHealthSchema
>;

export type PaymentCollectionItemDto = z.infer<
  typeof FinancesSchema.PaymentCollectionItemSchema
>;

export type FinancesDashboardDto = z.infer<
  typeof FinancesSchema.FinancesDashboardSchema
>;
