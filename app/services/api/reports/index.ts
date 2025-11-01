import { Reports } from "~/services/url";
import type { ReservationReportResponseDTO } from "./dto";
import http from "~/lib/http";
import useReportsSchema from "~/services/schema/reports.schema";
const { ReservationReportsSchema } = useReportsSchema();
async function getReservationReports(
  date: string
): Promise<ReservationReportResponseDTO> {
  try {
    const resp = await http.get(Reports.reservationReports(date));
    return ReservationReportsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const ReportsService = {
  getReservationReports,
};
