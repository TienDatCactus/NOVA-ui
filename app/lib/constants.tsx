import {
  type LucideIcon,
  HousePlus,
  ReceiptText,
  ClipboardMinus,
  Bath,
  Utensils,
  Users,
  Settings,
  HelpCircle,
  DollarSign,
  LayoutGrid,
  List,
  CalendarDays,
  PackageSearch,
  ChefHat,
  Boxes,
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
    url: "/dashboard/reservation",
    icon: HousePlus,
    isActive: true,
    items: [
      {
        title: "Báo cáo",
        url: "/dashboard/reservation",
      },
      {
        title: "Sơ đồ phòng",
        url: "/dashboard/reservation/bookings/grid",
      },
      {
        title: "Danh sách đặt phòng",
        url: "/dashboard/reservation/bookings/list",
      },
      {
        title: "Hóa đơn đặt phòng",
        url: "/dashboard/reservation/invoices",
      },
      {
        title: "Đặt phòng mới",
        url: "/dashboard/reservation/new-booking",
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
      {
        title: "Bảng giá",
        url: "/dashboard/rooms/prices",
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
    title: "Khách hàng",
    url: "/dashboard/customers",
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
  SUBS_PER_DAY,
  totalSubCols,
  SIDEBAR_NAV_MAIN,
  SIDEBAR_PROJECTS,
  SIDEBAR_TEAMS,
};
