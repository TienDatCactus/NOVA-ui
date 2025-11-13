import http from "~/lib/http";
import { Invoices } from "~/services/url";
import { InvoiceSchema } from "./invoice.schema";
import type {
  InvoiceListResponseDto,
  InvoiceDetailDto,
  InvoiceCalculateFeesResponseDto,
  InvoicePreviewRequestDto,
  InvoicePreviewResponseDto,
} from "./dto";
import type { InvoiceListParams } from "./invoice.types";

const {
  InvoiceListResponseWithMetaSchema,
  InvoiceDetailResponseSchema,
  InvoiceCalculateFeesResponseSchema,
  InvoicePreviewResponseSchema,
  InvoicePreviewRequestSchema,
} = InvoiceSchema;

/**
 * Get list of invoices with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise with invoice list and pagination metadata
 */
async function getInvoiceList(
  params?: InvoiceListParams
): Promise<InvoiceListResponseDto> {
  try {
    const resp = await http.get(Invoices.list, { params });
    return InvoiceListResponseWithMetaSchema.parse(resp);
  } catch (error) {
    console.error("Error fetching invoice list:", error);
    return Promise.reject(error);
  }
}

/**
 * Get invoice details by ID
 * @param invoiceId - UUID of the invoice
 * @returns Promise with invoice details
 */
async function getInvoiceDetail(invoiceId: string): Promise<InvoiceDetailDto> {
  try {
    const resp = await http.get(Invoices.detail(invoiceId));
    const parsed = InvoiceDetailResponseSchema.parse(resp);
    return parsed.data;
  } catch (error) {
    console.error(`Error fetching invoice detail for ID ${invoiceId}:`, error);
    return Promise.reject(error);
  }
}

async function calculateInvoiceFees({
  subtotalAmount,
}: {
  subtotalAmount: number;
}): Promise<InvoiceCalculateFeesResponseDto> {
  try {
    const resp = await http.post(Invoices.calculateFees, { subtotalAmount });
    return InvoiceCalculateFeesResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function previewBookingInvoice(
  data: InvoicePreviewRequestDto
): Promise<InvoicePreviewResponseDto> {
  try {
    const resp = await http.post(
      Invoices.previewBookingInvoice,
      InvoicePreviewRequestSchema.parse(data)
    );
    return InvoicePreviewResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const InvoicesService = {
  getInvoiceList,
  getInvoiceDetail,
  calculateInvoiceFees,
  previewBookingInvoice,
};
