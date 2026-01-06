import z from "zod";
import { PaymentSchema } from "~/services/api/payments/payments.schema";

const KpisBaseSchema = z.object({
  periodLabel: z.string(),
  totalRevenue: z.number(),
  revenueComparison: z.number(),
  revenueVariancePercent: z.number(),
  netProfit: z.number(),
  profitComparison: z.number(),
  profitVariancePercent: z.number(),
  occupancyPercent: z.number(),
  occupancyComparison: z.number(),
  occupancyVariancePoints: z.number(),
  adr: z.number(),
  adrComparison: z.number(),
  adrVariancePercent: z.number(),
  revPAR: z.number(),
  revPARComparison: z.number(),
  revPARVariancePercent: z.number(),
  totalBookings: z.number(),
  bookingsComparison: z.number(),
  bookingsVariancePercent: z.number(),
});

const RevenueBreakItemTypeEnum = z.enum(["Room", "FnB", "Service", "Other"]);

const RevenueBreakdownItemSchema = z.object({
  type: RevenueBreakItemTypeEnum,
  name: z.string(),
  amount: z.number(),
  percentage: z.number(),
});

const ChannelRevenueSchema = z.object({
  channelName: z.string(),
  amount: z.number(),
  percentage: z.number(),
  bookingCount: z.number(),
});

const BookingMetricsSchema = z.object({
  totalBookings: z.number(),
  roomNights: z.number(),
  averageStay: z.number(),
  checkIns: z.number(),
  checkOuts: z.number(),
  inHouse: z.number(),
  noShows: z.number(),
  cancellations: z.number(),
  cancellationRate: z.number(),
  newBookings: z.number(),
  walkIns: z.number(),
});

const RevenueTrendSchema = z.object({
  date: z.string(),
  totalRevenue: z.number(),
  roomRevenue: z.number(),
  fnBRevenue: z.number(),
  serviceRevenue: z.number(),
  otherRevenue: z.number(),
});

const FinancialHealthSchema = z.object({
  discountRate: z.number(),
  discountRateTarget: z.number(),
  discountRateVariance: z.number(),
  refundRate: z.number(),
  refundRateTarget: z.number(),
  refundRateVariance: z.number(),
  collectionRate: z.number(),
  collectionRateTarget: z.number(),
  collectionRateVariance: z.number(),
});

const PaymentCollectionItemSchema = z.object({
  method: PaymentSchema.PaymentMethodEnum,
  methodName: z.string(),
  amount: z.number(),
  percentage: z.number(),
  transactionCount: z.number(),
});

const FinancesDashboardSchema = z.object({
  todayKpis: KpisBaseSchema,
  thisMonthKpis: KpisBaseSchema,
  thisYearKpis: KpisBaseSchema,
  revenueBreakdown: z.array(RevenueBreakdownItemSchema),
  revenueByChannel: z.array(ChannelRevenueSchema),
  bookingMetrics: BookingMetricsSchema,
  revenueTrend: z.array(RevenueTrendSchema),
  financialHealth: FinancialHealthSchema,
  paymentCollection: z.array(PaymentCollectionItemSchema),
  otaReceivable: z.number(),
  generatedAt: z.string(),
  periodDescription: z.string(),
});

export const FinancesSchema = {
  KpisBaseSchema,
  RevenueBreakItemTypeEnum,
  RevenueBreakdownItemSchema,
  ChannelRevenueSchema,
  BookingMetricsSchema,
  RevenueTrendSchema,
  FinancialHealthSchema,
  PaymentCollectionItemSchema,
  FinancesDashboardSchema,
};
