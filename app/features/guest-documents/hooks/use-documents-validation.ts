import { useMemo } from "react";
import { useGetBookingDocumentsQuery } from "../container/query";

interface UseDocumentsValidationParams {
  bookingId: string;
  adultsAmount: number;
}

interface DocumentsValidationResult {
  hasAllDocuments: boolean;
  documentsCount: number;
  missingCount: number;
  isLoading: boolean;
}

/**
 * Hook to validate document completion for a booking
 * Used for check-in gate validation
 */
export function useDocumentsValidation({
  bookingId,
  adultsAmount,
}: UseDocumentsValidationParams): DocumentsValidationResult {
  const { data: documents, isPending } = useGetBookingDocumentsQuery(bookingId);

  const validation = useMemo(() => {
    const documentsCount = documents?.length || 0;
    const missingCount = Math.max(0, adultsAmount - documentsCount);
    const hasAllDocuments = documentsCount >= adultsAmount;

    return {
      hasAllDocuments,
      documentsCount,
      missingCount,
      isLoading: isPending,
    };
  }, [documents, adultsAmount, isPending]);

  return validation;
}
