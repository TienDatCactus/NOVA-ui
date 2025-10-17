export type Room = {
  roomId: string;
  roomName: string;
  price: number;
  images?: string[];
  description?: string;
  roomType: string;
  status: string;
  quantity: number;
  amenities?: string[];
};
export type ServiceCategory = "Dịch vụ" | "Thức ăn" | "Đồ uống";

export interface BookingListParams {
  weekStart?: string;
  date?: string;
  code?: string;
}
export interface ServiceListParams {
  includeInactive?: boolean;
  typeCode?: string;
}

export interface MenuListParams {
  includeInactive?: boolean;
  categoryCode?: string;
  q?: string;
}
