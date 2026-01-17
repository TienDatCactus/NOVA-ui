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
  address: z.string(),
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
});

const SaveNationalIdRequestSchema = z.object({
  bookingId: z.string(),
  customerId: z.string(),
  name: z.string(),
  idNumber: z.string(),
  dateOfBirth: z.string(),
  sex: z.string(),
  home: z.string(),
  address: z.string(),
  nationalCode: z.string(),
  scannedImageUrl: z.string(),
  note: z.string(),
});

const BookingDocumentItemSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  customerId: z.string(),
  documentType: DocumentType,
  fullName: z.string(),
  documentNumber: z.string(),
  dateOfBirth: z.string(),
  nationality: z.string().nullable(),
  placeOfBirth: z.string(),
  gender: z.string(),
  address: z.string(),
  dateOfIssue: z.string().nullable(),
  dateOfExpire: z.string().nullable(),
  idCardNumber: z.string().nullable(),
  scannedImagePath: z.string(),
  note: z.string(),
  createdAt: z.string(),
});

const BookingDocumentsResponseSchema = z.array(BookingDocumentItemSchema);

const UpdateGuestDocumentRequestSchema = z.object({
  fullName: z.string(),
  documentNumber: z.string(),
  dateOfBirth: z.string(),
  nationality: z.string(),
  placeOfBirth: z.string(),
  gender: z.string(),
  address: z.string(),
  dateOfIssue: z.string(),
  dateOfExpire: z.string(),
  idCardNumber: z.string(),
  note: z.string(),
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
