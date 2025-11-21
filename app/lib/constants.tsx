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
  Package,
  PackageSearch,
  Plus,
  ReceiptText,
  Settings,
  ShoppingCart,
  Tag,
  Users,
  Utensils,
  UserCog,
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
<<<<<<< HEAD
        title: "Sơ đồ phòng",
        url: "/dashboard/bookings/grid",
=======
        title: "Kiểm tra phòng trống",
        url: FE_URL.dashboard.bookings.grid,
>>>>>>> 29b4d650251822d9c787e79305e47c52c4e087b5
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
    title: "Dịch vụ",
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
        title: "Ca làm việc",
        url: FE_URL.dashboard.staff.workShifts,
      },
      {
        title: "Lịch làm việc",
        url: FE_URL.dashboard.staff.schedules,
      },
      {
        title: "Ngày nghỉ",
        url: FE_URL.dashboard.staff.holidays,
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
    title: "Quản lý kho",
    url: FE_URL.dashboard.stocks.items,
    icon: Package,
    items: [
      {
        title: "Hàng hóa",
        url: FE_URL.dashboard.stocks.items,
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
];

const SIDEBAR_PROJECTS: Array<{
  name: string;
  url: string;
  icon: LucideIcon;
}> = [
  {
    name: "Chat",
    url: FE_URL.dashboard.chat,
    icon: MessageSquareDot,
  },
  {
    name: "Đơn vị tính",
    url: FE_URL.dashboard.units,
    icon: PackageSearch,
  },
  {
    name: "Cài đặt",
    url: FE_URL.dashboard.settings,
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
    name: "Hóa đơn đặt phòng",
    icon: FileText,
    href: FE_URL.dashboard.bookings.invoices,
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
  { name: "Chat", icon: MessageSquareDot, href: FE_URL.dashboard.chat },
  { name: "Đơn vị tính", icon: PackageSearch, href: FE_URL.dashboard.units },
  { name: "Cài đặt", icon: Settings, href: FE_URL.dashboard.settings },
  { name: "Trợ giúp", icon: HelpCircle, href: FE_URL.dashboard.help },
];

const CUSTOMER_NAVS = [
  { name: "Inbox", icon: Settings, href: FE_URL.customer.inbox },
  { name: "Services & F&B", icon: Settings, href: FE_URL.customer.inbox },
  { name: "Guidelines", icon: Settings, href: FE_URL.customer.inbox },
  { name: "Map", icon: Settings, href: FE_URL.customer.map },
];
export {
  CHECK_IN_TIME,
  CHECK_OUT_TIME,
  COMMAND_BAR_ROUTES,
  SIDEBAR_NAV_MAIN,
  SIDEBAR_PROJECTS,
  SIDEBAR_TEAMS,
  SUPPORTED_LANGUAGES,
  CUSTOMER_NAVS,
};
