import http from "~/lib/http";
import { Invoices } from "~/services/url";
import type {
  AddCustomItemsRequestDto,
  InvoiceByBookingResponseDto,
  InvoiceCalculateFeesResponseDto,
  InvoiceDetailDto,
  InvoiceListResponseWithMetaDto,
  InvoicePaymentRequestDto,
  InvoicePaymentResponseDto,
  InvoicePreviewRequestDto,
  InvoicePreviewResponseDto,
  PaymentsFromInvoiceResponseDto,
  RefundInvoiceRequestDto,
} from "./dto";
import { InvoiceSchema } from "./invoice.schema";
import type { InvoiceListParams } from "./invoice.types";

const {
  InvoiceListResponseWithMetaSchema,
  InvoiceDetailSchema,
  InvoiceByBookingResponseSchema,
  PaymentsFromInvoiceResponseSchema,
  AddCustomItemsRequestSchema,
  RefundInvoiceRequestSchema,
  InvoicePaymentRequestSchema,
  InvoicePaymentResponseSchema,
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
): Promise<InvoiceListResponseWithMetaDto> {
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
    return InvoiceDetailSchema.parse(resp.data);
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

/**
 * Get invoices by booking ID
 * @param bookingId - UUID of the booking
 * @returns Promise with array of invoice details
 */
async function getInvoicesByBooking(
  bookingId: string
): Promise<InvoiceByBookingResponseDto> {
  try {
    const resp = await http.get(Invoices.listByBooking(bookingId));
    return InvoiceByBookingResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(`Error fetching invoices for booking ${bookingId}:`, error);
    return Promise.reject(error);
  }
}

/**
 * Get payments from an invoice
 * @param invoiceId - UUID of the invoice
 * @returns Promise with array of payments
 */
async function getInvoicePayments(
  invoiceId: string
): Promise<PaymentsFromInvoiceResponseDto> {
  try {
    const resp = await http.get(Invoices.payments(invoiceId));
    return PaymentsFromInvoiceResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(`Error fetching payments for invoice ${invoiceId}:`, error);
    return Promise.reject(error);
  }
}

/**
 * Add custom items to invoice
 * @param invoiceId - UUID of the invoice
 * @param data - Custom item data
 * @returns Promise with response
 */
async function addCustomItemsToInvoice(
  invoiceId: string,
  data: AddCustomItemsRequestDto
): Promise<any> {
  try {
    const idempotencyKey = crypto.randomUUID();
    const resp = await http.post(
      Invoices.addCustomItems(invoiceId),
      AddCustomItemsRequestSchema.parse(data),
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
    return resp.data;
  } catch (error) {
    console.error(`Error adding custom items to invoice ${invoiceId}:`, error);
    return Promise.reject(error);
  }
}

/**
 * Refund invoice
 * @param invoiceId - UUID of the invoice
 * @param data - Refund data
 * @returns Promise with response
 */
async function refundInvoice(
  invoiceId: string,
  data: RefundInvoiceRequestDto
): Promise<any> {
  try {
    const idempotencyKey = crypto.randomUUID();
    const resp = await http.post(
      Invoices.refund(invoiceId),
      RefundInvoiceRequestSchema.parse(data),
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
    return resp.data;
  } catch (error) {
    console.error(`Error refunding invoice ${invoiceId}:`, error);
    return Promise.reject(error);
  }
}

/**
 * Add payment to invoice
 * @param invoiceId - UUID of the invoice
 * @param data - Payment data
 * @returns Promise with payment response
 */
async function addInvoicePayment(
  invoiceId: string,
  data: InvoicePaymentRequestDto
): Promise<InvoicePaymentResponseDto> {
  try {
    const idempotencyKey = crypto.randomUUID();
    const resp = await http.post(
      Invoices.payments(invoiceId),
      InvoicePaymentRequestSchema.parse(data),
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
    return InvoicePaymentResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(`Error adding payment to invoice ${invoiceId}:`, error);
    return Promise.reject(error);
  }
}

/**
 * Void invoice
 * @param invoiceId - UUID of the invoice
 * @returns Promise with response
 */
async function voidInvoice(invoiceId: string): Promise<any> {
  try {
    const idempotencyKey = crypto.randomUUID();
    const resp = await http.post(
      Invoices.void(invoiceId),
      {},
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
    return resp.data;
  } catch (error) {
    console.error(`Error voiding invoice ${invoiceId}:`, error);
    return Promise.reject(error);
  }
}

/**
 * Export invoices
 * @param params - Export parameters
 * @returns Promise with exported data
 */
async function exportInvoices(date?: string): Promise<any> {
  try {
    const resp = await http.get(Invoices.export(date), {
      responseType: "blob",
    });
    const blob = new Blob([resp.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    return blob;
  } catch (error) {
    console.error("Error exporting invoices:", error);
    return Promise.reject(error);
  }
}

export const InvoicesService = {
  getInvoiceList,
  getInvoiceDetail,
  getInvoicesByBooking,
  getInvoicePayments,
  addCustomItemsToInvoice,
  refundInvoice,
  addInvoicePayment,
  voidInvoice,
  exportInvoices,
  calculateInvoiceFees,
  previewBookingInvoice,
};
