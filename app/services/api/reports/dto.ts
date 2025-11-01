import type z from "zod";
import useReportsSchema from "~/services/schema/reports.schema";

const { ReservationReportsSchema } = useReportsSchema();

type ReservationReportResponseDTO = z.infer<typeof ReservationReportsSchema>;

export type { ReservationReportResponseDTO };
