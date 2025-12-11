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
  RoleListResponseDto,
  ChatStaffListDto,
} from "./dto";
import type { UserListParams } from "./user.types";

const { ChangePasswordSchema } = UserSchema;

async function getUserList(
  params: UserListParams
): Promise<UserListResponseDto> {
  try {
    const resp = await http.get(User.list, { params });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getUserDetail(id: string): Promise<UserDetailResponseDto> {
  try {
    const resp = await http.get(User.detail(id));
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createUser(data: CreateUserDto): Promise<CreateUserResponseDto> {
  try {
    const resp = await http.post(User.create, data);
    return resp.data;
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
    const resp = await http.put(User.update(id), data);
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getRoleList(): Promise<RoleListResponseDto> {
  try {
    const resp = await http.get(User.roles);
    return resp.data;
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
    const resp = await http.post(User.lock(id), data);
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function unlockUser(id: string): Promise<UnlockUserResponseDto> {
  try {
    const resp = await http.post(User.unlock(id));
    return resp.data;
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
    const resp = await http.post(User.assignRoles(id), data);
    return resp.data;
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
    const resp = await http.delete(User.removeRoles(id), { data });
    return resp.data;
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
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getChatStaff(): Promise<ChatStaffListDto> {
  try {
    const resp = await http.get(User.chatStaff);
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function deleteUser(userId: string) {
  try {
    await http.delete(User.delete(userId));
  } catch (error) {
    console.error(error);
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
  getChatStaff,
  deleteUser,
};
