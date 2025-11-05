import http from "~/lib/http";
import { CustomerSchema } from "~/services/schema/customer.schema";
import { Customer } from "~/services/url";
import type {
  AssignRolesDto,
  AssignRolesResponseDto,
  CreateCustomerDto,
  CreateCustomerResponseDto,
  CustomerDetailResponseDto,
  CustomerListResponseDto,
  LockUserDto,
  LockUserResponseDto,
  RemoveRolesDto,
  RemoveRolesResponseDto,
  UnlockUserResponseDto,
  UpdateCustomerDto,
  UpdateCustomerResponseDto,
  ChangePasswordDto,
  ChangePasswordResponseDto,
} from "./dto";

const {
  CustomerListResponseSchema,
  CustomerDetailResponseSchema,
  CreateCustomerResponseSchema,
  UpdateCustomerResponseSchema,
  RoleListResponseSchema,
  LockUserResponseSchema,
  UnlockUserResponseSchema,
  AssignRolesResponseSchema,
  RemoveRolesResponseSchema,
  ChangePasswordSchema,
  ChangePasswordResponseSchema,
} = CustomerSchema;

async function getCustomerList(): Promise<CustomerListResponseDto> {
  try {
    const resp = await http.get(Customer.list);
    return CustomerListResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getCustomerDetail(
  id: string
): Promise<CustomerDetailResponseDto> {
  try {
    const resp = await http.get(Customer.detail(id));
    return CustomerDetailResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function createCustomer(
  data: CreateCustomerDto
): Promise<CreateCustomerResponseDto> {
  try {
    const resp = await http.post(Customer.create, data);
    return CreateCustomerResponseSchema.parse(resp);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function updateCustomer(
  id: string,
  data: UpdateCustomerDto
): Promise<UpdateCustomerResponseDto> {
  try {
    const resp: any = await http.put(Customer.update(id), data);
    return UpdateCustomerResponseSchema.parse(resp);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getRoleList(): Promise<string[]> {
  try {
    const resp = await http.get(Customer.roles);
    if (resp && typeof resp === "object" && "data" in resp) {
      return resp.data;
    }
    return [];
  } catch (error) {
    return Promise.reject(error);
  }
}

async function lockUser(
  id: string,
  data: LockUserDto
): Promise<LockUserResponseDto> {
  try {
    const resp: any = await http.post(Customer.lock(id), data);
    return LockUserResponseSchema.parse(resp);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function unlockUser(id: string): Promise<UnlockUserResponseDto> {
  try {
    const resp: any = await http.post(Customer.unlock(id));
    return UnlockUserResponseSchema.parse(resp);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function assignRoles(
  id: string,
  data: AssignRolesDto
): Promise<AssignRolesResponseDto> {
  try {
    const resp: any = await http.post(Customer.assignRoles(id), data);
    return AssignRolesResponseSchema.parse(resp);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function removeRoles(
  id: string,
  data: RemoveRolesDto
): Promise<RemoveRolesResponseDto> {
  try {
    const resp: any = await http.delete(Customer.removeRoles(id), { data });
    return RemoveRolesResponseSchema.parse(resp);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function changePassword(
  id: string,
  data: ChangePasswordDto
): Promise<ChangePasswordResponseDto> {
  try {
    const validatedData = ChangePasswordSchema.parse(data);
    const resp = await http.post(Customer.changePassword(id), validatedData);
    return ChangePasswordResponseSchema.parse(resp);
  } catch (error) {
    return Promise.reject(error);
  }
}

export const CustomerService = {
  getCustomerList,
  getCustomerDetail,
  createCustomer,
  updateCustomer,
  getRoleList,
  lockUser,
  unlockUser,
  assignRoles,
  removeRoles,
  changePassword,
};
