import http from "~/lib/http";
import { Stock } from "~/services/url";
import { StockItemsSchemas } from "./items.schema";
import type {
  StockItemsListDto,
  StockCreateItemDto,
  StockUpdateItemDto,
  StockItemDetailsDto,
  StockTransactionsResponseDto,
  StockAdjustRequestDto,
} from "./dto";
import type { ItemListParams } from "./items.types";

const {
  StockItemsListSchema,
  StockCreateItemSchema,
  StockUpdateItemSchema,
  StockItemDetailsSchema,
  StockTransactionsResponseSchema,
  StockAdjustRequestSchema,
} = StockItemsSchemas;

async function getStockItemList(
  params: ItemListParams
): Promise<StockItemsListDto> {
  try {
    const resp = await http.get(Stock.Items.list, { params });
    return StockItemsListSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createStockItem(
  data: StockCreateItemDto
): Promise<StockItemDetailsDto> {
  try {
    const validatedData = StockCreateItemSchema.parse(data);
    const resp = await http.post(Stock.Items.create, validatedData);
    return StockItemDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getStockItemDetail(
  id?: string,
  code?: string
): Promise<StockItemDetailsDto> {
  try {
    if (!id && !code) {
      throw new Error("Cần cung cấp id hoặc code");
    }

    const resp = id
      ? await http.get(Stock.Items.detail(id))
      : await http.get(Stock.Items.listByCode(code!));

    return StockItemDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateStockItem(
  id: string,
  data: StockUpdateItemDto
): Promise<StockItemDetailsDto> {
  try {
    const validatedData = StockUpdateItemSchema.parse(data);
    const resp = await http.put(Stock.Items.update(id), validatedData);
    return StockItemDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function deleteStockItem(id: string): Promise<void> {
  try {
    await http.delete(Stock.Items.delete(id));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getStockItemsTransactions(
  id: string,
  params?: ItemListParams
): Promise<StockTransactionsResponseDto> {
  try {
    const resp = await http.get(Stock.Items.transactions(id), { params });
    return StockTransactionsResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function adjustStock(
  id: string,
  data: StockAdjustRequestDto
): Promise<void> {
  try {
    const validatedData = StockAdjustRequestSchema.parse(data);
    await http.post(Stock.Items.adjustStock(id), validatedData);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const StockItemsService = {
  getStockItemList,
  createStockItem,
  getStockItemDetail,
  updateStockItem,
  deleteStockItem,
  getStockItemsTransactions,
  adjustStock,
};
