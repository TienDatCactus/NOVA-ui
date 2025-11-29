import http from "~/lib/http";
import { AuditLogs } from "~/services/url";
import { AuditSchema } from "./audit.schema";
import type {
  AuditListResponse,
  AuditDetail,
  ExportAuditRequest,
  ArchiveAuditRequest,
  CleanupAuditRequest,
  AuditStats,
} from "./dto";
import type { AuditListParams } from "./audit.types";

const { AuditListResponseSchema, AuditDetailSchema, AuditStatsSchema } =
  AuditSchema;

async function getAuditList(
  params: AuditListParams
): Promise<AuditListResponse> {
  try {
    const resp = await http.get(AuditLogs.list, { params });
    return AuditListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getAuditDetail(id: string): Promise<AuditDetail> {
  try {
    const resp = await http.get(AuditLogs.detail(id));
    return AuditDetailSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function exportAuditLogs(params: ExportAuditRequest): Promise<Blob> {
  try {
    const resp = await http.post(AuditLogs.export, {
      params,
      responseType: "blob",
    });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function archiveAuditLogs(
  data: ArchiveAuditRequest
): Promise<{ success: boolean; message: string; archivedCount: number }> {
  try {
    const resp = await http.post(AuditLogs.archive, data);
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getCleanupCount(
  olderThanMonths: number
): Promise<{ count: number }> {
  try {
    const resp = await http.get(AuditLogs.cleanUpCount, {
      params: { olderThanMonths },
    });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function cleanupAuditLogs(
  data: CleanupAuditRequest
): Promise<{ success: boolean; message: string; deletedCount: number }> {
  try {
    const resp = await http.post(AuditLogs.cleanUp, data);
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getAuditStats(params: AuditListParams): Promise<AuditStats> {
  try {
    const resp = await http.get(AuditLogs.stats, {
      params: {
        fromDate: params.FromDate,
        toDate: params.ToDate,
      },
    });
    return AuditStatsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const AuditService = {
  getAuditList,
  getAuditDetail,
  exportAuditLogs,
  archiveAuditLogs,
  getCleanupCount,
  cleanupAuditLogs,
  getAuditStats,
};
