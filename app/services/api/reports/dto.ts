import type z from "zod";
import { ReportsSchema } from "~/services/api/reports/reports.schema";

const { ReservationReportsSchema } = ReportsSchema;

export type ReservationReportResponseDTO = z.infer<
  typeof ReservationReportsSchema
>;
