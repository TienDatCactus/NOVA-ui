export interface ServiceTypeListParams {
  includeInactive?: boolean;
}
export interface ServiceDetailParams {
  id: string;
}

export interface UpdateServiceTypeDetailParams extends ServiceDetailParams {}
export interface DeleteServiceTypeDetailParams extends ServiceDetailParams {}
