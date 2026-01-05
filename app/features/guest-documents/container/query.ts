import { useQuery } from "@tanstack/react-query";
import { GuestDocumentsService } from "~/services/api/guest-documents";

export function useGetBookingDocumentsQuery(bookingId: string) {
  return useQuery({
    queryKey: ["booking-documents", bookingId],
    queryFn: () => GuestDocumentsService.getBookingDocuments(bookingId),
    enabled: !!bookingId,
  });
}

export function useGetDocumentDetailQuery(documentId: string) {
  return useQuery({
    queryKey: ["guest-document-detail", documentId],
    queryFn: () =>
      GuestDocumentsService.getDocumentsDetail(documentId.toString()),
    enabled: !!documentId,
  });
}
