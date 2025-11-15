import http from "~/lib/http";
import type { DiscountApplyRequest, DiscountOverrideRequest } from "./dto";
import { Discount } from "~/services/url";

async function applyDiscount(data: DiscountApplyRequest): Promise<void> {
  try {
    await http.post(Discount.apply, data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function overrideDiscount(data: DiscountOverrideRequest): Promise<void> {
  try {
    await http.post(Discount.override, data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const DiscountService = {
  applyDiscount,
  overrideDiscount,
};
