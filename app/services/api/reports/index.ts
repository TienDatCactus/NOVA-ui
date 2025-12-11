import { Reports } from "~/services/url";
import type { ReservationReportResponseDTO } from "./dto";
import http from "~/lib/http";
import { ReportsSchema } from "~/services/api/reports/reports.schema";
const { ReservationReportsSchema } = ReportsSchema;
async function getReservationReports(
  fromDate: string,
  toDate: string
): Promise<ReservationReportResponseDTO> {
  try {
    const resp = await http.get(Reports.reservationReports, {
      params: { fromDate, toDate },
    });
    return ReservationReportsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const ReportsService = {
  getReservationReports,
};
