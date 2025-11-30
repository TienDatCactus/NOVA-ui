import http from "~/lib/http";
import { Configs } from "~/services/url";
import { ConfigSchema } from "./configs.schema";
import type {
  ConfigListResponse,
  GroupedConfigListResponse,
  ConfigTimezoneListResponse,
  ConfigDetail,
  UpdateConfigRequest,
} from "./dto";

const {
  ConfigListResponseSchema,
  GroupedConfigListResponseSchema,
  ConfigTimezoneListResponseSchema,
  ConfigDetailSchema,
} = ConfigSchema;

async function getConfigList(): Promise<ConfigListResponse> {
  try {
    const resp = await http.get(Configs.list);
    return ConfigListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getGroupedConfigList(): Promise<GroupedConfigListResponse> {
  try {
    const resp = await http.get(Configs.groupedList);
    return GroupedConfigListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getTimezones(): Promise<ConfigTimezoneListResponse> {
  try {
    const resp = await http.get(Configs.timezones);
    return ConfigTimezoneListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getConfigDetail(key: string): Promise<ConfigDetail> {
  try {
    const resp = await http.get(Configs.detail(key));
    return ConfigDetailSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateConfig(
  key: string,
  data: UpdateConfigRequest
): Promise<ConfigDetail> {
  try {
    const resp = await http.put(Configs.update(key), data);
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function deleteConfig(key: string): Promise<void> {
  try {
    const resp = await http.delete(Configs.delete(key));
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const ConfigService = {
  getConfigList,
  getGroupedConfigList,
  getTimezones,
  getConfigDetail,
  updateConfig,
  deleteConfig,
};
