import http from "~/lib/http";
import { UserSchema } from "~/services/api/user/user.schema";
import { User } from "~/services/url";
import type {
  AssignRolesDto,
  AssignRolesResponseDto,
  CreateUserDto,
  CreateUserResponseDto,
  UserDetailResponseDto,
  UserListResponseDto,
  LockUserDto,
  LockUserResponseDto,
  RemoveRolesDto,
  RemoveRolesResponseDto,
  UnlockUserResponseDto,
  UpdateUserDto,
  UpdateUserResponseDto,
  ChangePasswordDto,
  ChangePasswordResponseDto,
} from "./dto";

const {
  UserListResponseSchema,
  UserDetailResponseSchema,
  CreateUserResponseSchema,
  UpdateUserResponseSchema,
  RoleListResponseSchema,
  LockUserResponseSchema,
  UnlockUserResponseSchema,
  AssignRolesResponseSchema,
  RemoveRolesResponseSchema,
  ChangePasswordSchema,
  ChangePasswordResponseSchema,
} = UserSchema;

async function getUserList(): Promise<UserListResponseDto> {
  try {
    const resp = await http.get(User.list);
    return UserListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getUserDetail(id: string): Promise<UserDetailResponseDto> {
  try {
    const resp = await http.get(User.detail(id));
    return UserDetailResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createUser(data: CreateUserDto): Promise<CreateUserResponseDto> {
  try {
    const resp = await http.post(User.create, data);
    return CreateUserResponseSchema.parse(resp);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateUser(
  id: string,
  data: UpdateUserDto
): Promise<UpdateUserResponseDto> {
  try {
    const resp: any = await http.put(User.update(id), data);
    return UpdateUserResponseSchema.parse(resp);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getRoleList(): Promise<string[]> {
  try {
    const resp = await http.get(User.roles);
    if (resp && typeof resp === "object" && "data" in resp) {
      return resp.data;
    }
    return [];
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function lockUser(
  id: string,
  data: LockUserDto
): Promise<LockUserResponseDto> {
  try {
    const resp: any = await http.post(User.lock(id), data);
    return LockUserResponseSchema.parse(resp);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function unlockUser(id: string): Promise<UnlockUserResponseDto> {
  try {
    const resp: any = await http.post(User.unlock(id));
    return UnlockUserResponseSchema.parse(resp);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function assignRoles(
  id: string,
  data: AssignRolesDto
): Promise<AssignRolesResponseDto> {
  try {
    const resp: any = await http.post(User.assignRoles(id), data);
    return AssignRolesResponseSchema.parse(resp);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function removeRoles(
  id: string,
  data: RemoveRolesDto
): Promise<RemoveRolesResponseDto> {
  try {
    const resp: any = await http.delete(User.removeRoles(id), { data });
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
    const resp = await http.post(User.changePassword(id), validatedData);
    return ChangePasswordResponseSchema.parse(resp);
  } catch (error) {
    return Promise.reject(error);
  }
}

export const UserService = {
  getUserList,
  getUserDetail,
  createUser,
  updateUser,
  getRoleList,
  lockUser,
  unlockUser,
  assignRoles,
  removeRoles,
  changePassword,
};
