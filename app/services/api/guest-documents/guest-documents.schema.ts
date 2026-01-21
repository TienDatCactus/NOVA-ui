import z from "zod";

const DocumentType = z.enum(["Passport", "NationalId"]);

const PassportScanResponseSchema = z.object({
  passportNumber: z.string(),
  name: z.string(),
  dateOfBirth: z.string(),
  nationality: z.string().nullable(),
  placeOfBirth: z.string(),
  sex: z.string(),
  idNumber: z.string(),
  dateOfIssue: z.string().nullable(),
  dateOfExpiry: z.string().nullable(),
  scannedImageUrl: z.string(),
  rawOcrResponse: z.string(),
  nationalCode: z.string(),
});

const NationalIdScanResponseSchema = z.object({
  idNumber: z.string(),
  name: z.string(),
  dateOfBirth: z.string(),
  sex: z.string(),
  home: z.string(),
  address: z.string().optional().nullable(),
  scannedImageUrl: z.string(),
  rawOcrResponse: z.string(),
  nationalCode: z.string(),
});

const SavePassportRequestSchema = z.object({
  bookingId: z.string(),
  customerId: z.string(),
  name: z.string(),
  passportNumber: z.string(),
  dateOfBirth: z.string(),
  nationality: z.string(),
  nationalCode: z.string(),
  placeOfBirth: z.string(),
  sex: z.string(),
  idNumber: z.string(),
  dateOfIssue: z.string(),
  dateOfExpiry: z.string(),
  scannedImageUrl: z.string(),
  note: z.string(),
  rawOcrResponse: z.string(),
});

const SaveNationalIdRequestSchema = z.object({
  bookingId: z.string(),
  customerId: z.string(),
  name: z.string(),
  idNumber: z.string(),
  dateOfBirth: z.string(),
  sex: z.string(),
  home: z.string(),
  address: z.string().nullable(),
  nationalCode: z.string(),
  scannedImageUrl: z.string(),
  note: z.string(),
  rawOcrResponse: z.string(),
});

const BookingDocumentItemSchema = z.object({
  id: z.string().optional().nullable(),
  bookingId: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  documentType: DocumentType.optional().nullable(),
  fullName: z.string().optional().nullable(),
  documentNumber: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  placeOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  dateOfIssue: z.string().optional().nullable(),
  dateOfExpire: z.string().optional().nullable(),
  idCardNumber: z.string().optional().nullable(),
  scannedImagePath: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
});

const BookingDocumentsResponseSchema = z.array(BookingDocumentItemSchema);

const UpdateGuestDocumentRequestSchema = z.object({
  fullName: z.string().optional().nullable(),
  documentNumber: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  placeOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  dateOfIssue: z.string().optional().nullable(),
  dateOfExpire: z.string().optional().nullable(),
  idCardNumber: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export const GuestDocumentsSchema = {
  PassportScanResponseSchema,
  NationalIdScanResponseSchema,
  SavePassportRequestSchema,
  SaveNationalIdRequestSchema,
  BookingDocumentItemSchema,
  BookingDocumentsResponseSchema,
  UpdateGuestDocumentRequestSchema,
  DocumentType,
};
