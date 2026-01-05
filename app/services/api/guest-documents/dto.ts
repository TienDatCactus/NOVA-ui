import type z from "zod";
import { GuestDocumentsSchema } from "./guest-documents.schema";

const {
  PassportScanResponseSchema,
  NationalIdScanResponseSchema,
  SavePassportRequestSchema,
  SaveNationalIdRequestSchema,
  BookingDocumentItemSchema,
  BookingDocumentsResponseSchema,
  UpdateGuestDocumentRequestSchema,
  DocumentType,
} = GuestDocumentsSchema;

export type PassportScanResponseDto = z.infer<
  typeof PassportScanResponseSchema
>;
export type NationalIdScanResponseDto = z.infer<
  typeof NationalIdScanResponseSchema
>;
export type SavePassportRequestDto = z.infer<typeof SavePassportRequestSchema>;
export type SaveNationalIdRequestDto = z.infer<
  typeof SaveNationalIdRequestSchema
>;
export type BookingDocumentItemDto = z.infer<typeof BookingDocumentItemSchema>;
export type BookingDocumentsResponseDto = z.infer<
  typeof BookingDocumentsResponseSchema
>;
export type UpdateGuestDocumentRequestDto = z.infer<
  typeof UpdateGuestDocumentRequestSchema
>;
export type DocumentTypeDto = z.infer<typeof DocumentType>;
