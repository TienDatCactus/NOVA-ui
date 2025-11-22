import http from "~/lib/http";
import { Stock } from "~/services/url";
import { PurchaseRequestsSchemas } from "./purchase-requests.schema";
import type {
  PurchaseRequestListDto,
  CreatePurchaseRequestDto,
  PurchaseRequestDetailsDto,
  UpdatePurchaseRequestDto,
  ReceiveStockRequestDto,
} from "./dto";
import type { PurchaseRequestListParams } from "./purchase-requests.types";

const {
  PurchaseRequestListSchema,
  CreatePurchaseRequestSchema,
  PurchaseRequestDetailsSchema,
  UpdatePurchaseRequestSchema,
  ReceiveStockRequestSchema,
} = PurchaseRequestsSchemas;

async function getPurchaseRequestList(
  params: PurchaseRequestListParams
): Promise<PurchaseRequestListDto> {
  try {
    const resp = await http.get(Stock.PurchaseRequests.list, { params });
    return PurchaseRequestListSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createPurchaseRequest(
  data: CreatePurchaseRequestDto
): Promise<PurchaseRequestDetailsDto> {
  try {
    const validatedData = CreatePurchaseRequestSchema.parse(data);
    const resp = await http.post(Stock.PurchaseRequests.create, validatedData);
    return PurchaseRequestDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getPurchaseRequestDetail(
  id: string
): Promise<PurchaseRequestDetailsDto> {
  try {
    const resp = await http.get(Stock.PurchaseRequests.detail(id));
    return PurchaseRequestDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updatePurchaseRequest(
  id: string,
  data: UpdatePurchaseRequestDto
): Promise<PurchaseRequestDetailsDto> {
  try {
    const validatedData = UpdatePurchaseRequestSchema.parse(data);
    const resp = await http.put(
      Stock.PurchaseRequests.update(id),
      validatedData
    );
    return PurchaseRequestDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function deletePurchaseRequest(id: string): Promise<void> {
  try {
    await http.delete(Stock.PurchaseRequests.delete(id));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function approvePurchaseRequest(
  id: string
): Promise<PurchaseRequestDetailsDto> {
  try {
    const resp = await http.post(Stock.PurchaseRequests.approve(id));
    return PurchaseRequestDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function rejectPurchaseRequest(
  id: string,
  reason?: string
): Promise<PurchaseRequestDetailsDto> {
  try {
    const resp = await http.post(Stock.PurchaseRequests.reject(id), {
      reason,
    });
    return PurchaseRequestDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function cancelPurchaseRequest(
  id: string,
  reason?: string
): Promise<PurchaseRequestDetailsDto> {
  try {
    const resp = await http.post(Stock.PurchaseRequests.cancel(id), {
      reason,
    });
    return PurchaseRequestDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
async function receiveStock(
  purchaseRequestId: string,
  data: ReceiveStockRequestDto
): Promise<void> {
  try {
    const validatedData = ReceiveStockRequestSchema.parse(data);
    await http.post(
      Stock.PurchaseRequests.receiveStock(purchaseRequestId),
      validatedData
    );
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const PurchaseRequestsService = {
  getPurchaseRequestList,
  createPurchaseRequest,
  getPurchaseRequestDetail,
  updatePurchaseRequest,
  deletePurchaseRequest,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  cancelPurchaseRequest,
  receiveStock,
};
