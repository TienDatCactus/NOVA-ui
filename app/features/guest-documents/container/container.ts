import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GuestDocumentsService } from "~/services/api/guest-documents";
import type {
  SaveNationalIdRequestDto,
  SavePassportRequestDto,
  UpdateGuestDocumentRequestDto,
} from "~/services/api/guest-documents/dto";

export function useScanPassportMutation() {
  return useMutation({
    mutationKey: ["scan-passport"],
    mutationFn: async (image: File) =>
      await GuestDocumentsService.scanPassport(image),
  });
}

export function useScanNationalIdMutation() {
  return useMutation({
    mutationKey: ["scan-national-id"],
    mutationFn: async (image: File) =>
      await GuestDocumentsService.scanNationalId(image),
  });
}

export function useSavePassportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["save-passport"],
    mutationFn: async (data: SavePassportRequestDto) =>
      await GuestDocumentsService.savePassport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-documents"] });
    },
  });
}

export function useSaveNationalIdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["save-national-id"],
    mutationFn: async (data: SaveNationalIdRequestDto) =>
      await GuestDocumentsService.saveNationalId(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-documents"] });
    },
  });
}

export function useUpdateDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-document"],
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateGuestDocumentRequestDto;
    }) => await GuestDocumentsService.updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-documents"] });
      queryClient.invalidateQueries({ queryKey: ["guest-document-detail"] });
    },
  });
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-document"],
    mutationFn: async (id: string) =>
      await GuestDocumentsService.deleteDocuments(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-documents"] });
    },
  });
}

export function useExportGuestDocumentsMutation() {
  return useMutation({
    mutationKey: ["export-guest-documents"],
    mutationFn: async ({
      checkInFrom,
      checkInTo,
    }: {
      checkInFrom: string;
      checkInTo: string;
    }) =>
      await GuestDocumentsService.exportGuestDocuments(checkInFrom, checkInTo),
  });
}
