import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
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
    onSuccess: () => {
      toast.success("Quét giấy tờ khách hàng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(`${error.response?.data?.message || error.message}`);
      }
    },
  });
}

export function useScanNationalIdMutation() {
  return useMutation({
    mutationKey: ["scan-national-id"],
    mutationFn: async (image: File) =>
      await GuestDocumentsService.scanNationalId(image),
    onSuccess: () => {
      toast.success("Quét giấy tờ khách hàng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(`${error.response?.data?.error || error.message}`);
      }
    },
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
      toast.success("Lưu giấy tờ khách hàng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(`${error.response?.data?.error || error.message}`);
      }
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
      toast.success("Lưu giấy tờ khách hàng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(`${error.response?.data?.error || error.message}`);
      }
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
      toast.success("Cập nhật giấy tờ khách hàng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(`${error.response?.data?.error || error.message}`);
      }
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
      toast.success("Xóa giấy tờ khách hàng thành công");
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(`${error.response?.data?.error || error.message}`);
      }
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
    onSuccess: () => {
      toast.success("Xuất file XML thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(`${error.response?.data?.error || error.message}`);
      }
    },
  });
}
export function useExportGuestDocumentsByBookingMutation() {
  return useMutation({
    mutationKey: ["export-guest-documents-by-booking"],
    mutationFn: async (bookingId: string) =>
      await GuestDocumentsService.exportGuestDocumentsByBooking(bookingId),
    onSuccess: () => {
      toast.success("Xuất file XML thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(`${error.response?.data?.error || error.message}`);
      }
    },
  });
}
