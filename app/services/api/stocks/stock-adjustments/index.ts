import http from "~/lib/http";
import { Stock } from "~/services/url";
import { StockAdjustmentsSchemas } from "./stock-adjustments.schema";
import type {
  StockAdjustmentListDto,
  CreateStockAdjustmentDto,
  StockAdjustmentDetailsDto,
  UpdateStockAdjustmentDto,
} from "./dto";
import type { StockAdjustmentListParams } from "./stock-adjustments.types";

const {
  StockAdjustmentListSchema,
  CreateStockAdjustmentSchema,
  StockAdjustmentDetailsSchema,
  UpdateStockAdjustmentSchema,
} = StockAdjustmentsSchemas;

async function getStockAdjustmentList(
  params: StockAdjustmentListParams
): Promise<StockAdjustmentListDto> {
  try {
    const resp = await http.get(Stock.StockAdjustments.list, { params });
    return StockAdjustmentListSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createStockAdjustment(
  data: CreateStockAdjustmentDto
): Promise<StockAdjustmentDetailsDto> {
  try {
    const validatedData = CreateStockAdjustmentSchema.parse(data);
    const resp = await http.post(Stock.StockAdjustments.create, validatedData);
    return StockAdjustmentDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getStockAdjustmentDetail(
  id: string
): Promise<StockAdjustmentDetailsDto> {
  try {
    const resp = await http.get(Stock.StockAdjustments.detail(id));
    return StockAdjustmentDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateStockAdjustment(
  id: string,
  data: UpdateStockAdjustmentDto
): Promise<StockAdjustmentDetailsDto> {
  try {
    const validatedData = UpdateStockAdjustmentSchema.parse(data);
    const resp = await http.put(
      Stock.StockAdjustments.update(id),
      validatedData
    );
    return StockAdjustmentDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function deleteStockAdjustment(id: string): Promise<void> {
  try {
    await http.delete(Stock.StockAdjustments.delete(id));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function applyStockAdjustment(
  id: string
): Promise<StockAdjustmentDetailsDto> {
  try {
    const resp = await http.post(Stock.StockAdjustments.apply(id));
    return StockAdjustmentDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const StockAdjustmentsService = {
  getStockAdjustmentList,
  createStockAdjustment,
  getStockAdjustmentDetail,
  updateStockAdjustment,
  deleteStockAdjustment,
  applyStockAdjustment,
};
