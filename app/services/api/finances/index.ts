import { FinancialReports } from "~/services/url";
import type { FinancialDashboardSmeDto } from "./dto";
import type { FinancialReportsListParams } from "./finances.types";
import { FinancesSchema } from "./finances.schema";
import http from "~/lib/http";

const { FinancialDashboardSmeSchema } = FinancesSchema;

async function getFinancialReport(
  params: FinancialReportsListParams
): Promise<FinancialDashboardSmeDto> {
  try {
    const resp = await http.get(FinancialReports.getFinancialReport, {
      params,
    });
    // Schema validation following NOVA pattern
    return FinancialDashboardSmeSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const FinancesService = {
  getFinancialReport,
};
