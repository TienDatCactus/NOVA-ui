import http from "~/lib/http";
import type {
  BookingDocumentItemDto,
  BookingDocumentsResponseDto,
  NationalIdScanResponseDto,
  PassportScanResponseDto,
  SaveNationalIdRequestDto,
  SavePassportRequestDto,
  UpdateGuestDocumentRequestDto,
} from "./dto";
import { GuestDocuments } from "~/services/url";
import { GuestDocumentsSchema } from "./guest-documents.schema";

const {
  SavePassportRequestSchema,
  SaveNationalIdRequestSchema,
  BookingDocumentsResponseSchema,
  BookingDocumentItemSchema,
} = GuestDocumentsSchema;

async function scanPassport(image: Blob): Promise<PassportScanResponseDto> {
  try {
    const formData = new FormData();
    formData.append("image", image);

    const resp = await http.post(GuestDocuments.scanPassport, {
      body: formData,
    });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function scanNationalId(image: Blob): Promise<NationalIdScanResponseDto> {
  try {
    const formData = new FormData();
    formData.append("image", image);

    const resp = await http.post(GuestDocuments.scanNationalId, {
      body: formData,
    });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
async function savePassport(data: SavePassportRequestDto): Promise<void> {
  try {
    const resp = await http.post(
      GuestDocuments.savePassport,
      SavePassportRequestSchema.parse(data)
    );
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
async function saveNationalId(
  data: SaveNationalIdRequestDto
): Promise<NationalIdScanResponseDto> {
  try {
    const resp = await http.post(
      GuestDocuments.saveNationalId,
      SaveNationalIdRequestSchema.parse(data)
    );
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getBookingDocuments(
  bookingId: string
): Promise<BookingDocumentsResponseDto> {
  try {
    const resp = await http.get(GuestDocuments.getDocumentByBooking(bookingId));
    return BookingDocumentsResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getDocumentsDetail(id: string): Promise<BookingDocumentItemDto> {
  try {
    const resp = await http.get(GuestDocuments.getDocumentDetail(id));
    return BookingDocumentItemSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateDocument(
  id: string,
  data: UpdateGuestDocumentRequestDto
): Promise<void> {
  try {
    const resp = await http.put(GuestDocuments.updateDocument(id), data);
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function deleteDocuments(id: string): Promise<void> {
  try {
    const resp = await http.delete(GuestDocuments.deleteDocument(id));
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const GuestDocumentsService = {
  scanPassport,
  scanNationalId,
  savePassport,
  saveNationalId,
  getBookingDocuments,
  getDocumentsDetail,
  updateDocument,
  deleteDocuments,
};
