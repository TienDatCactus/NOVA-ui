import http from "~/lib/http";
import { Orders } from "~/services/url";
import type {
  AddItemsToPOSOrderRequestDto,
  AddItemsToPOSOrderResponseDto,
  CreatePOSOrderRequestDto,
  CreatePOSOrderResponseDto,
  CreateServiceOrderRequestDto,
  POSOrderDetailResponseDto,
  POSOrderListByBookingResponseDto,
  POSOrderPayNowRequestDto,
  POSOrderPrintDataDto,
  ServiceOrderDetailDto,
  ServiceOrderListByBookingDetailDto,
  ServiceOrderPayNowRequestDto,
  SetScheduledServiceOrderRequestDto,
  UpdateServiceOrderRequestDto,
} from "./dto";
import { OrderSchema } from "./order.schema";

const {
  CreatePOSOrderResponseSchema,
  AddItemsToPOSOrderResponseSchema,
  POSOrderDetailResponseSchema,
  // POSOrderListByInvoiceResponseSchema,
  POSOrderPrintDataSchema,
  POSOrderListByBookingResponseSchema,
  ServiceOrderDetailSchema,
  ServiceOrderListByBookingDetailSchema,
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

async function getPosOrderList(
  bookingId?: string,
  bookingRoomId?: string
): Promise<POSOrderListByBookingResponseDto> {
  try {
    // Filter out undefined params to avoid sending them to backend
    const params: Record<string, string> = {};
    if (bookingId) params.bookingId = bookingId;
    if (bookingRoomId) params.bookingRoomId = bookingRoomId;

    const resp = await http.get(Orders.list, {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return POSOrderListByBookingResponseSchema.parse(resp.data);
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

async function setServedOrderItem(
  orderId: string,
  itemId: string,
  data: { servedAt: Date }
) {
  try {
    const resp = await http.post(Orders.setServed(orderId, itemId), {
      servedAt: data.servedAt.toISOString(),
    });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function setScheduledOrder(orderId: string, data: { scheduledAt: Date }) {
  try {
    const resp = await http.post(Orders.setScheduled(orderId), {
      scheduledAt: data.scheduledAt.toISOString(),
    });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/* ----------------------------------- */
//? Service Orders

/**
 *? Create a new service order
 */
async function createServiceOrder(
  data: CreateServiceOrderRequestDto
): Promise<void> {
  try {
    await http.post(Orders.createServiceOrder, data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 *? Update an existing service order
 */
async function updateServiceOrder(
  orderId: string,
  data: UpdateServiceOrderRequestDto
): Promise<void> {
  try {
    await http.put(Orders.updateServiceOrder(orderId), data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 *? Get service order details by ID
 */
async function getServiceOrderDetail(
  orderId: string
): Promise<ServiceOrderDetailDto> {
  try {
    const resp = await http.get(Orders.detailServiceOrder(orderId));
    return ServiceOrderDetailSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 *? Complete a service order (mark as performed)
 */
async function completeServiceOrder(orderId: string): Promise<void> {
  try {
    await http.post(Orders.completeServiceOrder(orderId), null);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 *? Cancel a service order
 */
async function cancelServiceOrder(orderId: string): Promise<void> {
  try {
    await http.post(Orders.cancelServiceOrder(orderId), null);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 *? Get list of service orders by booking ID
 * @param bookingId - UUID of the booking
 */
async function getServiceOrdersByBooking(
  bookingId: string
): Promise<ServiceOrderListByBookingDetailDto> {
  try {
    const resp = await http.get(Orders.listServiceOrdersByBooking(bookingId));
    return ServiceOrderListByBookingDetailSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 *? Pay service order now (mid-stay payment)
 * Creates a mid-stay invoice and processes payment
 */
async function payServiceOrderNow(
  orderId: string,
  data: ServiceOrderPayNowRequestDto
): Promise<void> {
  try {
    await http.post(Orders.payServiceOrderNow(orderId), data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 *? Set/update scheduled time for service order
 */
async function setScheduledServiceOrder(
  orderId: string,
  data: SetScheduledServiceOrderRequestDto
): Promise<void> {
  try {
    await http.post(Orders.setScheduledServiceOrder(orderId), data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const OrderService = {
  // POS Orders
  createPOSOrder,
  addItemsToPOSOrder,
  deleteItemFromPOSOrder,
  cancelPOSOrder,
  completePOSOrder,
  getPOSOrderDetail,
  getPOSOrderPrintData,
  payPOSOrderNow,
  getPosOrderList,
  setScheduledOrder,
  setServedOrderItem,
  // Service Orders
  createServiceOrder,
  updateServiceOrder,
  getServiceOrderDetail,
  completeServiceOrder,
  cancelServiceOrder,
  getServiceOrdersByBooking,
  payServiceOrderNow,
  setScheduledServiceOrder,
};
