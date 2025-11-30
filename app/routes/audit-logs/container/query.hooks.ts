import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuditService } from "~/services/api/audit";
import type { AuditListParams } from "~/services/api/audit/audit.types";
import type {
  ExportAuditRequest,
  ArchiveAuditRequest,
  CleanupAuditRequest,
} from "~/services/api/audit/dto";

export function useAuditLogs(params: AuditListParams) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: async () => await AuditService.getAuditList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useAuditDetail(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["audit-logs", id],
    queryFn: async () => await AuditService.getAuditDetail(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useAuditStats(params: AuditListParams) {
  return useQuery({
    queryKey: ["audit-stats", params],
    queryFn: async () => await AuditService.getAuditStats(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (params: ExportAuditRequest) =>
      AuditService.exportAuditLogs(params),
  });
}

export function useArchiveAuditLogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ArchiveAuditRequest) =>
      AuditService.archiveAuditLogs(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["audit-logs"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["audit-stats"],
        refetchType: "active",
      });
    },
  });
}

export function useCleanupAuditLogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CleanupAuditRequest) =>
      AuditService.cleanupAuditLogs(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["audit-logs"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["audit-stats"],
        refetchType: "active",
      });
    },
  });
}

export function useCleanupCount() {
  return useQuery({
    queryKey: ["audit-cleanup-count"],
    queryFn: async () => await AuditService.getCleanupCount(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
