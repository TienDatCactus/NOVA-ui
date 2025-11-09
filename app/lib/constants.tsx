import {
  type LucideIcon,
  Bath,
  HelpCircle,
  HousePlus,
  ListOrdered,
  MessageSquareDot,
  PackageSearch,
  ReceiptText,
  Settings,
  Users,
  Utensils,
} from "lucide-react";

const SERVICE_CATEGORIES = ["Dịch vụ", "Thức ăn", "Đồ uống"];

const ROOM_COUNT = 13;
const DAYS_COUNT = 7;
const SUBS_PER_DAY = 2;
const headerRows = 1;
const rowHeight = 64;
const firstColWidth = 220;
const totalSubCols = DAYS_COUNT * SUBS_PER_DAY;

const CHECK_IN_TIME = "13:00 PM";
const CHECK_OUT_TIME = "11:00 AM";

// Sidebar Navigation Data
const SIDEBAR_NAV_MAIN: Array<{
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: Array<{
    title: string;
    url: string;
  }>;
}> = [
  {
    title: "Đặt phòng",
    url: "/dashboard/bookings",
    icon: HousePlus,
    isActive: true,
    items: [
      {
        title: "Báo cáo",
        url: "/dashboard/bookings",
      },
      {
        title: "Sơ đồ phòng",
        url: "/dashboard/bookings/grid",
      },
      {
        title: "Danh sách đặt phòng",
        url: "/dashboard/bookings/list",
      },
      {
        title: "Hóa đơn đặt phòng",
        url: "/dashboard/bookings/invoices",
      },
      {
        title: "Đặt phòng mới",
        url: "/dashboard/bookings/new-booking",
      },
    ],
  },
  {
    title: "Buồng phòng",
    url: "/dashboard/rooms",
    icon: Bath,
    items: [
      {
        title: "Danh sách phòng",
        url: "/dashboard/rooms",
      },
      {
        title: "Loại phòng",
        url: "/dashboard/rooms/types",
      },
    ],
  },
  {
    title: "Dịch vụ",
    url: "/dashboard/services",
    icon: Utensils,
    items: [
      {
        title: "Danh sách dịch vụ",
        url: "/dashboard/services",
      },
      {
        title: "Loại dịch vụ",
        url: "/dashboard/services/types",
      },
      {
        title: "Thực đơn",
        url: "/dashboard/services/menu",
      },
      {
        title: "Danh mục món ăn",
        url: "/dashboard/services/menu-categories",
      },
    ],
  },
  {
    title: "Đơn hàng",
    url: "/dashboard/orders",
    icon: ListOrdered,
    items: [
      {
        title: "Đơn món ăn",
        url: "/dashboard/orders",
      },
      {
        title: "Đơn dịch vụ",
        url: "/dashboard/orders/service-orders",
      },
      {
        title: "POS Món ăn",
        url: "/dashboard/menu-pos",
      },
      {
        title: "POS Dịch vụ",
        url: "/dashboard/service-pos",
      },
    ],
  },
  {
    title: "Tài khoản",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Hóa đơn",
    url: "/dashboard/invoices",
    icon: ReceiptText,
  },
];

const SIDEBAR_PROJECTS: Array<{
  name: string;
  url: string;
  icon: LucideIcon;
}> = [
  {
    name: "Chat",
    url: "/dashboard/chat",
    icon: MessageSquareDot,
  },
  {
    name: "Đơn vị tính",
    url: "/dashboard/units",
    icon: PackageSearch,
  },
  {
    name: "Cài đặt",
    url: "/settings",
    icon: Settings,
  },
  {
    name: "Trợ giúp",
    url: "/help",
    icon: HelpCircle,
  },
];

const SIDEBAR_TEAMS = [
  {
    name: "NOVA Resort",
    logo: HousePlus,
    plan: "Enterprise",
  },
];

export {
  CHECK_IN_TIME,
  CHECK_OUT_TIME,
  DAYS_COUNT,
  firstColWidth,
  headerRows,
  ROOM_COUNT,
  rowHeight,
  SERVICE_CATEGORIES,
  SIDEBAR_NAV_MAIN,
  SIDEBAR_PROJECTS,
  SIDEBAR_TEAMS,
  SUBS_PER_DAY,
  totalSubCols,
};
