import {
  BadgeQuestionMark,
  Bath,
  ClipboardMinus,
  HandPlatter,
  Handshake,
  HousePlus,
  IdCardLanyard,
  LayoutDashboard,
  ReceiptText,
  Search,
  Settings,
  Users,
  Warehouse,
} from "lucide-react";
import type { JSX } from "react";

const NAV_ITEMS: Array<{ title: string; icon: JSX.Element }> = [
  {
    title: "Bảng điều khiển",
    icon: <LayoutDashboard />,
  },
  {
    title: "Đối tác",
    icon: <Handshake />,
  },
  {
    title: "Phòng",
    icon: <Bath />,
  },
  {
    title: "Hàng hóa",
    icon: <Warehouse />,
  },
  {
    title: "Nhân viên",
    icon: <IdCardLanyard />,
  },
  { title: "Báo cáo", icon: <ClipboardMinus /> },
];

const SERVICES_ITEMS: Array<{
  title: string;
  description: string;
  category: string[];
}> = [
  {
    title: "Bảng điều khiển",
    description:
      "Cung cấp cái nhìn tổng quan về hoạt động hệ thống, thống kê và báo cáo nhanh.",
    category: ["Thông tin", "Quản trị"],
  },
  {
    title: "Nhân viên",
    description:
      "Quản lý hồ sơ, phân quyền và thông tin nhân sự trong tổ chức.",
    category: ["Thông tin", "Quản trị"],
  },
  {
    title: "Đối tác",
    description:
      "Quản lý danh sách nhà cung cấp, khách hàng, đối tác chiến lược và các hợp đồng liên quan.",
    category: ["Đối tác", "Quan hệ"],
  },
  {
    title: "Phòng",
    description:
      "Quản lý cơ sở vật chất, phòng ban hoặc khu vực sử dụng dịch vụ.",
    category: ["Cơ sở hạ tầng", "Dịch vụ"],
  },
  {
    title: "Hàng hóa",
    description:
      "Theo dõi tình trạng hàng hóa, tồn kho và quản lý luồng nhập – xuất.",
    category: ["Cơ sở hạ tầng", "Dịch vụ"],
  },
];

const SERVICE_CATEGORIES = ["Dịch vụ", "Thức ăn", "Đồ uống"];
const DASHBOARD_ITEMS_RECEPTIONIST: Array<{
  id: number;
  title: string;
  icon: JSX.Element;
  href: string;
  children?: Array<{ title: string; href: string }>;
}> = [
  {
    id: 1,
    title: "Đặt phòng",
    icon: <HousePlus />,
    href: "/dashboard/reservation",
  },
  {
    id: 2,
    title: "Buồng phòng",
    icon: <Bath />,
    href: "/dashboard/rooms",
  },
  {
    id: 4,
    title: "Dịch vụ",
    icon: <HandPlatter />,
    href: "/dashboard/services",
  },
  {
    id: 5,
    title: "Hóa đơn",
    icon: <ReceiptText />,
    href: "/dashboard/invoices",
  },
];
const SUB_DASHBOARD_ITEMS: Array<{
  id: number;
  title: string;
  icon: JSX.Element;
  href: string;
}> = [
  {
    id: 1,
    title: "Cài đặt",
    icon: <Settings />,
    href: "/dashboard",
  },
  {
    id: 2,
    title: "Tìm kiếm",
    icon: <Search />,
    href: "/dashboard",
  },
  {
    id: 3,
    title: "Trợ giúp",
    icon: <BadgeQuestionMark />,
    href: "/dashboard",
  },
];

const RESERVATION_TOP_NAV_ITEMS: Array<{
  icon?: JSX.Element;
  title: string;
  href?: string;
  children?: Array<{ title: string; href: string }>;
}> = [
  {
    icon: <ClipboardMinus size={16} />,
    title: "Báo cáo Lễ tân",
    href: "/dashboard/reservation",
  },
  {
    icon: <HousePlus size={16} />,
    title: "Lịch đặt phòng",
    children: [
      { title: "Sơ đồ", href: "/dashboard/reservation/bookings/grid" },
      {
        title: "Timeline",
        href: "/dashboard/reservation/bookings/timeline",
      },
      { title: "Danh sách", href: "/dashboard/reservation/bookings/list" },
    ],
  },
  {
    icon: <ReceiptText size={16} />,
    title: "Hóa đơn",
    href: "/dashboard/reservation/new",
  },
];
const ROOMS_TOP_NAV_ITEMS: Array<{
  icon?: JSX.Element;
  title: string;
  href?: string;
  children?: Array<{ title: string; href: string }>;
}> = [
  {
    icon: <HousePlus size={16} />,
    title: "Phòng",
    href: "/dashboard/rooms",
  },
  {
    icon: <ClipboardMinus size={16} />,
    title: "Hạng phòng",
    href: "/dashboard/rooms/types",
  },

  {
    icon: <ReceiptText size={16} />,
    title: "Thiết lập giá phòng",
    href: "/dashboard/rooms/prices",
  },
];
const SERVICES_TOP_NAV_ITEMS: Array<{
  icon?: JSX.Element;
  title: string;
  href?: string;
  children?: Array<{ title: string; href: string }>;
}> = [
  {
    icon: <ClipboardMinus size={16} />,
    title: "Dịch vụ",
    href: "/dashboard/reservation",
  },
  {
    icon: <HousePlus size={16} />,
    title: "Menu",
  },
];
const INVOICES_TOP_NAV_ITEMS: Array<{
  icon?: JSX.Element;
  title: string;
  href?: string;
  children?: Array<{ title: string; href: string }>;
}> = [
  {
    icon: <ClipboardMinus size={16} />,
    title: "Báo cáo Lễ tân",
    href: "/dashboard/reservation",
  },
  {
    icon: <HousePlus size={16} />,
    title: "Lịch đặt phòng",
    children: [
      { title: "Sơ đồ", href: "/dashboard/reservation/bookings/grid" },
      {
        title: "Timeline",
        href: "/dashboard/reservation/bookings/timeline",
      },
      { title: "Danh sách", href: "/dashboard/reservation/bookings/list" },
    ],
  },
  {
    icon: <ReceiptText size={16} />,
    title: "Hóa đơn",
    href: "/dashboard/reservation/new",
  },
];

const TOP_NAV_CONFIG = {
  "/reservation": RESERVATION_TOP_NAV_ITEMS,
  "/rooms": ROOMS_TOP_NAV_ITEMS,
  "/services": SERVICES_TOP_NAV_ITEMS,
  "/invoices": INVOICES_TOP_NAV_ITEMS,
} as const;

const ROOM_TYPE = ["Traditional", "Romantic", "Unique", "Chalet"];

// Room Management Status (Backend Enum 0-6)
const ROOM_MANAGEMENT_STATUS = {
  Available: "0", // Còn trống
  Occupied: "1", // Đã có khách
  Dirty: "2", // Cần dọn dẹp
  OutOfService: "3", // Ngưng sử dụng
  Reserved: "4", // Đã được đặt trước
  Cleaning: "5", // Đang được dọn dẹp
  Locked: "6", // Bị khóa
} as const;

const ROOM_MANAGEMENT_STATUS_LABELS: Record<string, string> = {
  [ROOM_MANAGEMENT_STATUS.Available]: "Còn trống",
  [ROOM_MANAGEMENT_STATUS.Occupied]: "Đã có khách",
  [ROOM_MANAGEMENT_STATUS.Dirty]: "Cần dọn dẹp",
  [ROOM_MANAGEMENT_STATUS.OutOfService]: "Ngưng sử dụng",
  [ROOM_MANAGEMENT_STATUS.Reserved]: "Đã được đặt trước",
  [ROOM_MANAGEMENT_STATUS.Cleaning]: "Đang được dọn dẹp",
  [ROOM_MANAGEMENT_STATUS.Locked]: "Bị khóa",
} as const;

const ROOM_MANAGEMENT_STATUS_COLORS: Record<string, string> = {
  [ROOM_MANAGEMENT_STATUS.Available]: "bg-green-500 text-white",
  [ROOM_MANAGEMENT_STATUS.Occupied]: "bg-red-500 text-white",
  [ROOM_MANAGEMENT_STATUS.Dirty]: "bg-yellow-500 text-black",
  [ROOM_MANAGEMENT_STATUS.OutOfService]: "bg-gray-500 text-white",
  [ROOM_MANAGEMENT_STATUS.Reserved]: "bg-blue-500 text-white",
  [ROOM_MANAGEMENT_STATUS.Cleaning]: "bg-orange-500 text-white",
  [ROOM_MANAGEMENT_STATUS.Locked]: "bg-purple-500 text-white",
} as const;

const ROOM_STATUS = {
  AVAILABLE: "Phòng trống cả ngày",
  CHECKOUT_EXPECTED: "Phòng dự kiến trả",
  CHECKIN_EXPECTED: "Phòng dự kiến nhận",
  OCCUPIED: "Phòng đang sử dụng",
  OCCUPANCY_RATE: "Công suất sử dụng",
} as const;

const ROOM_STATUS_COLORS = {
  "Phòng trống cả ngày": "#22c55e", // Green
  "Phòng dự kiến trả": "#facc15", // Yellow
  "Phòng dự kiến nhận": "#3b82f6", // Blue
  "Phòng đang sử dụng": "#ef4444", // Red
  "Công suất sử dụng": "#8b5cf6", // Purple
} as const;

const BOOKING_CHANNEL = [
  "Agoda",
  "Booking.com",
  "Expedia",
  "Ctrip",
  "BnB",
  "Direct",
  "Công Ty",
];
const ROOM_COUNT = 13;
const DAYS_COUNT = 7;
const SUBS_PER_DAY = 2;
const headerRows = 1;
const rowHeight = 64;
const firstColWidth = 220;
const totalSubCols = DAYS_COUNT * SUBS_PER_DAY;
export {
  NAV_ITEMS,
  SERVICES_ITEMS,
  DASHBOARD_ITEMS_RECEPTIONIST,
  SUB_DASHBOARD_ITEMS,
  ROOM_COUNT,
  DAYS_COUNT,
  SUBS_PER_DAY,
  headerRows,
  rowHeight,
  firstColWidth,
  totalSubCols,
  TOP_NAV_CONFIG,
  ROOM_TYPE,
  BOOKING_CHANNEL,
  SERVICE_CATEGORIES,
  ROOM_STATUS,
  ROOM_STATUS_COLORS,
  ROOM_MANAGEMENT_STATUS,
  ROOM_MANAGEMENT_STATUS_LABELS,
  ROOM_MANAGEMENT_STATUS_COLORS,
};
