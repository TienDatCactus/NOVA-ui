import http from "~/lib/http";
import { Orders } from "~/services/url";
import { OrderSchema } from "~/services/schema/order.schema";
import type {
  CreatePOSOrderRequestDto,
  CreatePOSOrderResponseDto,
  AddItemsToPOSOrderRequestDto,
  AddItemsToPOSOrderResponseDto,
  POSOrderDetailResponseDto,
  POSOrderListResponseDto,
  POSOrderPrintDataDto,
} from "./dto";

const {
  CreatePOSOrderResponseSchema,
  AddItemsToPOSOrderResponseSchema,
  POSOrderDetailResponseSchema,
  POSOrderListResponseSchema,
  POSOrderPrintDataSchema,
} = OrderSchema;

/**
 * Create a new POS order
 */
async function createPOSOrder(
  data: CreatePOSOrderRequestDto
): Promise<CreatePOSOrderResponseDto> {
  try {
    const resp = await http.post(Orders.createPOS, data);
    return CreatePOSOrderResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Add items to an existing POS order
 */
async function addItemsToPOSOrder(
  orderId: string,
  data: AddItemsToPOSOrderRequestDto
): Promise<AddItemsToPOSOrderResponseDto> {
  try {
    const resp = await http.post(Orders.addItemsToPOS(orderId), data);
    return AddItemsToPOSOrderResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Delete an item from a POS order
 */
async function deleteItemFromPOSOrder(
  orderId: string,
  itemId: string
): Promise<void> {
  try {
    await http.delete(Orders.deleteItemFromPOS(orderId, itemId));
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Cancel a POS order
 */
async function cancelPOSOrder(orderId: string): Promise<void> {
  try {
    await http.post(Orders.cancelPOSOrder(orderId));
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Complete a POS order
 */
async function completePOSOrder(orderId: string): Promise<void> {
  try {
    await http.post(Orders.completePOSOrder(orderId));
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Get POS order details by ID
 */
async function getPOSOrderDetail(
  orderId: string
): Promise<POSOrderDetailResponseDto> {
  try {
    const resp = await http.get(Orders.detailPOS(orderId));
    return POSOrderDetailResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Get list of POS orders by invoice ID
 */
async function getPOSOrdersByInvoice(
  invoiceId: string
): Promise<POSOrderListResponseDto> {
  try {
    const resp = await http.get(Orders.listPOSbyInvoice(invoiceId));
    return POSOrderListResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Get print data for a POS order
 */
async function getPOSOrderPrintData(
  orderId: string
): Promise<POSOrderPrintDataDto> {
  try {
    const resp = await http.get(Orders.printPOSorder(orderId));
    return POSOrderPrintDataSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

export const OrderService = {
  createPOSOrder,
  addItemsToPOSOrder,
  deleteItemFromPOSOrder,
  cancelPOSOrder,
  completePOSOrder,
  getPOSOrderDetail,
  getPOSOrdersByInvoice,
  getPOSOrderPrintData,
};
