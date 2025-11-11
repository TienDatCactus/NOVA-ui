import {
  type LucideIcon,
  Bath,
  BarChart3,
  Calendar,
  FileText,
  Grid3x3,
  HelpCircle,
  HousePlus,
  List,
  ListOrdered,
  LogIn,
  MessageSquareDot,
  PackageSearch,
  Plus,
  ReceiptText,
  Settings,
  ShoppingCart,
  Tag,
  Users,
  Utensils,
  UtensilsCrossed,
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
  items?: Array<{
    title: string;
    url: string;
  }>;
}> = [
  {
    title: "Đặt phòng",
    url: "/dashboard/bookings",
    icon: HousePlus,
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
        url: "/dashboard/orders/menu-orders",
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

// Command Bar Navigation - Flat list of all routes
const COMMAND_BAR_ROUTES: Array<{
  name: string;
  icon: LucideIcon;
  href: string;
}> = [
  // Auth

  // Bookings
  { name: "Báo cáo đặt phòng", icon: BarChart3, href: "/dashboard/bookings" },
  { name: "Sơ đồ phòng", icon: Grid3x3, href: "/dashboard/bookings/grid" },
  { name: "Danh sách đặt phòng", icon: List, href: "/dashboard/bookings/list" },
  {
    name: "Hóa đơn đặt phòng",
    icon: FileText,
    href: "/dashboard/bookings/invoices",
  },
  {
    name: "Đặt phòng mới",
    icon: Plus,
    href: "/dashboard/bookings/new-booking",
  },

  // Rooms
  { name: "Danh sách phòng", icon: Bath, href: "/dashboard/rooms" },
  { name: "Loại phòng", icon: Tag, href: "/dashboard/rooms/types" },

  // Services
  { name: "Danh sách dịch vụ", icon: Utensils, href: "/dashboard/services" },
  { name: "Loại dịch vụ", icon: Tag, href: "/dashboard/services/types" },
  { name: "Thực đơn", icon: UtensilsCrossed, href: "/dashboard/services/menu" },
  {
    name: "Danh mục món ăn",
    icon: List,
    href: "/dashboard/services/menu-categories",
  },

  // Orders
  {
    name: "Đơn món ăn",
    icon: ListOrdered,
    href: "/dashboard/orders/menu-orders",
  },
  {
    name: "Đơn dịch vụ",
    icon: ListOrdered,
    href: "/dashboard/orders/service-orders",
  },
  { name: "POS Món ăn", icon: ShoppingCart, href: "/dashboard/menu-pos" },
  { name: "POS Dịch vụ", icon: ShoppingCart, href: "/dashboard/service-pos" },

  // Others
  { name: "Tài khoản", icon: Users, href: "/dashboard/users" },
  { name: "Hóa đơn", icon: ReceiptText, href: "/dashboard/invoices" },
  { name: "Chat", icon: MessageSquareDot, href: "/dashboard/chat" },
  { name: "Đơn vị tính", icon: PackageSearch, href: "/dashboard/units" },
  { name: "Cài đặt", icon: Settings, href: "/settings" },
  { name: "Trợ giúp", icon: HelpCircle, href: "/help" },
];

export {
  CHECK_IN_TIME,
  CHECK_OUT_TIME,
  COMMAND_BAR_ROUTES,
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
