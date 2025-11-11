import http from "~/lib/http";
import { StaffRole } from "~/services/url";
import { StaffRoleSchema } from "./staff-role.schema";
import type { StaffRoleListResponse } from "./dto";

const { StaffRoleListResponseSchema } = StaffRoleSchema;

async function getStaffRoleList(): Promise<StaffRoleListResponse> {
  try {
    const response = await http.get(StaffRole.list);
    return StaffRoleListResponseSchema.parse(response);
  } catch (error) {
    return Promise.reject(error);
  }
}

export const StaffRoleService = {
  getStaffRoleList,
};
