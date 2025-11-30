import {
  type LucideIcon,
  BarChart3,
  Bath,
  Calendar,
  FileText,
  Grid3x3,
  HelpCircle,
  HousePlus,
  List,
  ListOrdered,
  MessageSquareDot,
  Package,
  PackageSearch,
  Plus,
  Receipt,
  ReceiptText,
  ScrollText,
  Settings,
  ShoppingCart,
  Tag,
  TrendingUp,
  UserCog,
  Users,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import FE_URL from "~/lib/fe-url";

// Translation supported languages
const SUPPORTED_LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

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
    url: FE_URL.dashboard.bookings.list,
    icon: HousePlus,
    items: [
      {
        title: "Báo cáo",
        url: FE_URL.dashboard.bookings.reports,
      },
      {
        title: "Kiểm tra phòng trống",
        url: FE_URL.dashboard.bookings.grid,
      },
      {
        title: "Danh sách đặt phòng",
        url: FE_URL.dashboard.bookings.list,
      },
      {
        title: "Hóa đơn đặt phòng",
        url: "/dashboard/bookings/invoices",
      },
      {
        title: "Đặt phòng mới",
        url: FE_URL.dashboard.bookings.newBooking,
      },
    ],
  },
  {
    title: "Buồng phòng",
    url: FE_URL.dashboard.rooms.list,
    icon: Bath,
    items: [
      {
        title: "Danh sách phòng",
        url: FE_URL.dashboard.rooms.list,
      },
      {
        title: "Loại phòng",
        url: FE_URL.dashboard.rooms.types,
      },
    ],
  },
  {
    title: " Dịch vụ & F&B",
    url: FE_URL.dashboard.services.list,
    icon: Utensils,
    items: [
      {
        title: "Danh sách dịch vụ",
        url: FE_URL.dashboard.services.list,
      },
      {
        title: "Loại dịch vụ",
        url: FE_URL.dashboard.services.types,
      },
      {
        title: "Thực đơn",
        url: FE_URL.dashboard.services.menu,
      },
      {
        title: "Danh mục món ăn",
        url: FE_URL.dashboard.services.menuCategories,
      },
    ],
  },
  {
    title: "Đơn hàng",
    url: FE_URL.dashboard.orders.menuOrders,
    icon: ListOrdered,
    items: [
      {
        title: "Đơn món ăn",
        url: FE_URL.dashboard.orders.menuOrders,
      },
      {
        title: "Đơn dịch vụ",
        url: FE_URL.dashboard.orders.serviceOrders,
      },
      {
        title: "POS Món ăn",
        url: FE_URL.dashboard.orders.menuPos,
      },
      {
        title: "POS Dịch vụ",
        url: FE_URL.dashboard.orders.servicePos,
      },
    ],
  },
  {
    title: "Nhân viên",
    url: FE_URL.dashboard.staff.list,
    icon: UserCog,
    items: [
      {
        title: "Nhân sự",
        url: FE_URL.dashboard.staff.list,
      },
      {
        title: "Vai trò",
        url: FE_URL.dashboard.staff.roles,
      },

      {
        title: "Ngày nghỉ",
        url: FE_URL.dashboard.staff.holidays,
      },
      {
        title: "Lịch làm việc của nhân viên",
        url: FE_URL.dashboard.staff.shifts,
      },
      {
        title: "Bảng lương",
        url: "/dashboard/staff/payrolls",
      },
    ],
  },
  {
    title: "Quản lý kho",
    url: FE_URL.dashboard.stocks.items,
    icon: Package,
    items: [
      {
        title: "Hàng hóa",
        url: FE_URL.dashboard.stocks.items,
      },
      {
        title: "Danh mục hàng",
        url: FE_URL.dashboard.stocks.itemCategories,
      },
      {
        title: "Yêu cầu mua hàng",
        url: FE_URL.dashboard.stocks.purchaseRequests,
      },
      {
        title: "Điều chỉnh kho",
        url: FE_URL.dashboard.stocks.adjustments,
      },
    ],
  },
  {
    title: "Tài khoản",
    url: FE_URL.dashboard.users,
    icon: Users,
  },

  {
    title: "Hóa đơn",
    url: FE_URL.dashboard.invoices,
    icon: ReceiptText,
  },
  {
    title: "Chi phí",
    url: FE_URL.dashboard.expenses,
    icon: Receipt,
  },
  {
    title: "Báo cáo tài chính",
    url: FE_URL.dashboard.finances.dashboard,
    icon: TrendingUp,
  },
];

const SIDEBAR_PROJECTS: Array<{
  name: string;
  url: string;
  icon: LucideIcon;
}> = [
  {
    name: "Ca làm việc",
    url: FE_URL.dashboard.workShifts,
    icon: Calendar,
  },
  {
    name: "Chat",
    url: FE_URL.dashboard.chat,
    icon: MessageSquareDot,
  },
  {
    name: "Lịch sử truy vấn",
    url: FE_URL.dashboard.auditLogs,
    icon: ScrollText,
  },
  {
    name: "Đơn vị tính",
    url: FE_URL.dashboard.units,
    icon: PackageSearch,
  },
  {
    name: "Cài đặt",
    url: FE_URL.dashboard.configs,
    icon: Settings,
  },
  {
    name: "Trợ giúp",
    url: FE_URL.dashboard.help,
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
  {
    name: "Báo cáo đặt phòng",
    icon: BarChart3,
    href: FE_URL.dashboard.bookings.reports,
  },
  { name: "Sơ đồ phòng", icon: Grid3x3, href: FE_URL.dashboard.bookings.grid },
  {
    name: "Danh sách đặt phòng",
    icon: List,
    href: FE_URL.dashboard.bookings.list,
  },

  {
    name: "Đặt phòng mới",
    icon: Plus,
    href: FE_URL.dashboard.bookings.newBooking,
  },

  // Rooms
  { name: "Danh sách phòng", icon: Bath, href: FE_URL.dashboard.rooms.list },
  { name: "Loại phòng", icon: Tag, href: FE_URL.dashboard.rooms.types },

  // Services
  {
    name: "Danh sách dịch vụ",
    icon: Utensils,
    href: FE_URL.dashboard.services.list,
  },
  { name: "Loại dịch vụ", icon: Tag, href: FE_URL.dashboard.services.types },
  {
    name: "Thực đơn",
    icon: UtensilsCrossed,
    href: FE_URL.dashboard.services.menu,
  },
  {
    name: "Danh mục món ăn",
    icon: List,
    href: FE_URL.dashboard.services.menuCategories,
  },

  // Orders
  {
    name: "Đơn món ăn",
    icon: ListOrdered,
    href: FE_URL.dashboard.orders.menuOrders,
  },
  {
    name: "Đơn dịch vụ",
    icon: ListOrdered,
    href: FE_URL.dashboard.orders.serviceOrders,
  },
  {
    name: "POS Món ăn",
    icon: ShoppingCart,
    href: FE_URL.dashboard.orders.menuPos,
  },
  {
    name: "POS Dịch vụ",
    icon: ShoppingCart,
    href: FE_URL.dashboard.orders.servicePos,
  },

  // Others
  { name: "Tài khoản", icon: Users, href: FE_URL.dashboard.users },
  { name: "Hóa đơn", icon: ReceiptText, href: FE_URL.dashboard.invoices },
  { name: "Chi phí", icon: Receipt, href: FE_URL.dashboard.expenses },
  {
    name: "Báo cáo tài chính",
    icon: TrendingUp,
    href: FE_URL.dashboard.finances.dashboard,
  },
  { name: "Chat", icon: MessageSquareDot, href: FE_URL.dashboard.chat },
  { name: "Đơn vị tính", icon: PackageSearch, href: FE_URL.dashboard.units },
  { name: "Cài đặt", icon: Settings, href: FE_URL.dashboard.configs },
  { name: "Trợ giúp", icon: HelpCircle, href: FE_URL.dashboard.help },
];

const CUSTOMER_NAVS = [
  { name: "Inbox", icon: Settings, href: FE_URL.customer.inbox },
  { name: "Catalog", icon: Settings, href: FE_URL.customer.catalog },
  { name: "Guidelines", icon: Settings, href: FE_URL.customer.guidelines },
  { name: "Map", icon: Settings, href: FE_URL.customer.map },
];
export {
  CHECK_IN_TIME,
  CHECK_OUT_TIME,
  COMMAND_BAR_ROUTES,
  CUSTOMER_NAVS,
  SIDEBAR_NAV_MAIN,
  SIDEBAR_PROJECTS,
  SIDEBAR_TEAMS,
  SUPPORTED_LANGUAGES,
};
