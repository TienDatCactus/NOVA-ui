import type z from "zod";
import { ReportsSchema } from "~/services/schema/reports.schema";

const { ReservationReportsSchema } = ReportsSchema;

type ReservationReportResponseDTO = z.infer<typeof ReservationReportsSchema>;

export type { ReservationReportResponseDTO };
