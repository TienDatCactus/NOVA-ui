import http from "~/lib/http";
import { Orders } from "~/services/url";
import type {
  AddItemsToPOSOrderRequestDto,
  AddItemsToPOSOrderResponseDto,
  CreatePOSOrderRequestDto,
  CreatePOSOrderResponseDto,
  POSOrderDetailResponseDto,
  POSOrderPayNowRequestDto,
  POSOrderPrintDataDto,
} from "./dto";
import { OrderSchema } from "./order.schema";

const {
  CreatePOSOrderResponseSchema,
  AddItemsToPOSOrderResponseSchema,
  POSOrderDetailResponseSchema,
  // POSOrderListByInvoiceResponseSchema,
  POSOrderPrintDataSchema,
} = OrderSchema;

/**
 *? Create a new POS order
 */
async function createPOSOrder(
  data: CreatePOSOrderRequestDto
): Promise<CreatePOSOrderResponseDto> {
  try {
    const resp = await http.post(Orders.createPosOrder, data);
    return CreatePOSOrderResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 *? Add items to an existing POS order
 */
async function addItemsToPOSOrder(
  orderId: string,
  data: AddItemsToPOSOrderRequestDto
): Promise<AddItemsToPOSOrderResponseDto> {
  try {
    const resp = await http.post(Orders.addItemsToPos(orderId), data);
    return AddItemsToPOSOrderResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 *? Delete an item from a POS order
 */
async function deleteItemFromPOSOrder(
  orderId: string,
  itemId: string
): Promise<void> {
  try {
    await http.delete(Orders.deleteItemFromPos(orderId, itemId));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 *? Cancel a POS order
 */
async function cancelPOSOrder(orderId: string): Promise<void> {
  try {
    await http.post(Orders.cancelPosOrder(orderId), null);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 *? Complete a POS order
 */
async function completePOSOrder(orderId: string): Promise<void> {
  try {
    await http.post(Orders.completePosOrder(orderId), null);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * ?Get POS order details by ID
 */
async function getPOSOrderDetail(
  orderId: string
): Promise<POSOrderDetailResponseDto> {
  try {
    const resp = await http.get(Orders.detailPOS(orderId));
    return POSOrderDetailResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 *? Get list of POS orders by invoice ID
 */
// async function getPOSOrdersByInvoice(
//   invoiceId: string
// ): Promise<POSOrderListResponseDto> {
//   try {
//     const resp = await http.get(Orders.listPosOrderbyInvoice(invoiceId));
//     return POSOrderListByInvoiceResponseSchema.parse(resp.data);
//   } catch (error) {
//     console.error(error);
//     return Promise.reject(error);
//   }
// }

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
    console.error(error);
    return Promise.reject(error);
  }
}
async function payPOSOrderNow(orderId: string, data: POSOrderPayNowRequestDto) {
  try {
    const resp = await http.post(Orders.payNow(orderId), data);
    return resp.data;
  } catch (error) {
    console.error(error);
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
  // getPOSOrdersByInvoice,
  getPOSOrderPrintData,
  payPOSOrderNow,
};
