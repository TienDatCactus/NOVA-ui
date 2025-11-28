import { FinancialReports } from "~/services/url";
import type { FinancesDashboardDto } from "./dto";
import type { FinancialReportsListParams } from "./finances.types";
import http from "~/lib/http";

async function getFinancialReport(
  params: FinancialReportsListParams
): Promise<FinancesDashboardDto> {
  try {
    const resp = await http.get(FinancialReports.getFinancialReport, {
      params,
    });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getFinancialReportCached(
  params: FinancialReportsListParams
): Promise<FinancesDashboardDto> {
  try {
    const resp = await http.get(FinancialReports.getFinancialReportCached, {
      params,
    });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const FinancesService = {
  getFinancialReport,
  getFinancialReportCached,
};
