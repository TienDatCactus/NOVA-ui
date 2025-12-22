import {
  type LucideIcon,
  BarChart3,
  Bath,
  BookImage,
  Calendar,
  Grid3x3,
  HandHelping,
  HousePlus,
  Inbox,
  List,
  ListOrdered,
  MapIcon,
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
import { RouteModule } from "~/lib/auth/roles";
import FE_URL from "~/lib/fe-url";

// Translation supported languages
const SUPPORTED_LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" }, // Hindu → Hindi (ngôn ngữ)
  { code: "it", label: "Italiano", flag: "🇮🇹" }, // Ý
  { code: "es", label: "Español", flag: "🇪🇸" }, // Tây Ban Nha
  { code: "zh", label: "中文", flag: "🇨🇳" }, // Trung Quốc
];

const CHECK_IN_TIME = "13:00 PM";
const CHECK_OUT_TIME = "11:00 AM";

// Sidebar Navigation Data
const SIDEBAR_NAV_MAIN: Array<{
  title: string;
  url: string;
  icon: LucideIcon;
  module?: RouteModule;
  items?: Array<{
    title: string;
    url: string;
    module?: RouteModule;
  }>;
}> = [
  {
    title: "Đặt phòng",
    url: FE_URL.dashboard.bookings.list,
    icon: HousePlus,
    module: RouteModule.Bookings,
    items: [
      {
        title: "Báo cáo",
        url: FE_URL.dashboard.bookings.reports,
        module: RouteModule.Reports,
      },
      {
        title: "Kiểm tra phòng trống",
        url: FE_URL.dashboard.bookings.grid,
        module: RouteModule.Bookings,
      },
      {
        title: "Danh sách đặt phòng",
        url: FE_URL.dashboard.bookings.list,
        module: RouteModule.Bookings,
      },
    ],
  },
  {
    title: "Buồng phòng",
    url: FE_URL.dashboard.rooms.list,
    icon: Bath,
    module: RouteModule.Rooms,
    items: [
      {
        title: "Danh sách phòng",
        url: FE_URL.dashboard.rooms.list,
        module: RouteModule.Rooms,
      },
      {
        title: "Hạng phòng",
        url: FE_URL.dashboard.rooms.types,
        module: RouteModule.RoomTypes,
      },
    ],
  },
  {
    title: " Dịch vụ & F&B",
    url: FE_URL.dashboard.services.list,
    icon: Utensils,
    module: RouteModule.Services,
    items: [
      {
        title: "Danh sách dịch vụ",
        url: FE_URL.dashboard.services.list,
        module: RouteModule.Services,
      },
      {
        title: "Loại dịch vụ",
        url: FE_URL.dashboard.services.types,
        module: RouteModule.ServiceTypes,
      },
      {
        title: "Thực đơn",
        url: FE_URL.dashboard.services.menu,
        module: RouteModule.Menu,
      },
      {
        title: "Danh mục món ăn",
        url: FE_URL.dashboard.services.menuCategories,
        module: RouteModule.MenuCategories,
      },
    ],
  },
  {
    title: "Đơn hàng",
    url: FE_URL.dashboard.orders.menuOrders,
    icon: ListOrdered,
    module: RouteModule.Orders,
    items: [
      {
        title: "Đơn món ăn",
        url: FE_URL.dashboard.orders.menuOrders,
        module: RouteModule.Orders,
      },
      {
        title: "Đơn dịch vụ",
        url: FE_URL.dashboard.orders.serviceOrders,
        module: RouteModule.Orders,
      },
      {
        title: "POS Món ăn",
        url: FE_URL.dashboard.orders.menuPos,
        module: RouteModule.Orders,
      },
      {
        title: "POS Dịch vụ",
        url: FE_URL.dashboard.orders.servicePos,
        module: RouteModule.Orders,
      },
    ],
  },
  {
    title: "Nhân viên",
    url: FE_URL.dashboard.staff.list,
    icon: UserCog,
    module: RouteModule.Staff,
    items: [
      {
        title: "Nhân sự",
        url: FE_URL.dashboard.staff.list,
        module: RouteModule.Staff,
      },
      {
        title: "Chức vụ",
        url: FE_URL.dashboard.staff.roles,
        module: RouteModule.StaffRoles,
      },

      {
        title: "Ngày nghỉ",
        url: FE_URL.dashboard.staff.holidays,
        module: RouteModule.Holidays,
      },
      {
        title: "Lịch làm việc của nhân viên",
        url: FE_URL.dashboard.staff.shifts,
        module: RouteModule.StaffShifts,
      },
      {
        title: "Bảng lương",
        url: "/dashboard/staff/payrolls",
        module: RouteModule.Payroll,
      },
    ],
  },
  {
    title: "Quản lý kho",
    url: FE_URL.dashboard.stocks.items,
    icon: Package,
    module: RouteModule.Stock,
    items: [
      {
        title: "Hàng hóa",
        url: FE_URL.dashboard.stocks.items,
        module: RouteModule.Stock,
      },
      {
        title: "Danh mục hàng",
        url: FE_URL.dashboard.stocks.itemCategories,
        module: RouteModule.Stock,
      },
      {
        title: "Yêu cầu mua hàng",
        url: FE_URL.dashboard.stocks.purchaseRequests,
        module: RouteModule.Stock,
      },
      {
        title: "Điều chỉnh kho",
        url: FE_URL.dashboard.stocks.adjustments,
        module: RouteModule.Stock,
      },
    ],
  },
  {
    title: "Tài khoản",
    url: FE_URL.dashboard.users,
    icon: Users,
    module: RouteModule.Users,
  },

  {
    title: "Hóa đơn",
    url: FE_URL.dashboard.invoices,
    icon: ReceiptText,
    module: RouteModule.Invoices,
  },
  {
    title: "Chi phí",
    url: FE_URL.dashboard.expenses,
    icon: Receipt,
    module: RouteModule.Expenses,
  },
  {
    title: "Báo cáo tài chính",
    url: FE_URL.dashboard.finances.dashboard,
    icon: TrendingUp,
    module: RouteModule.FinancialReports,
  },
];

const SIDEBAR_PROJECTS: Array<{
  name: string;
  url: string;
  icon: LucideIcon;
  module?: RouteModule;
}> = [
  {
    name: "Ca làm việc",
    url: FE_URL.dashboard.workShifts,
    icon: Calendar,
    module: RouteModule.WorkShifts,
  },
  {
    name: "Chat",
    url: FE_URL.dashboard.chat,
    icon: MessageSquareDot,
    module: RouteModule.Chat,
  },
  {
    name: "Lịch sử truy vấn",
    url: FE_URL.dashboard.auditLogs,
    icon: ScrollText,
    module: RouteModule.AuditLogs,
  },
  {
    name: "Đơn vị tính",
    url: FE_URL.dashboard.units,
    icon: PackageSearch,
    module: RouteModule.Units,
  },
  {
    name: "Cài đặt",
    url: FE_URL.dashboard.configs,
    icon: Settings,
    module: RouteModule.Configs,
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
];

const CUSTOMER_NAVS = [
  { name: "nav.inbox", icon: Inbox, href: FE_URL.customer.inbox },
  { name: "nav.catalog", icon: BookImage, href: FE_URL.customer.catalog },
  {
    name: "nav.guidelines",
    icon: HandHelping,
    href: FE_URL.customer.guidelines,
  },
  { name: "nav.map", icon: MapIcon, href: FE_URL.customer.map },
];

const TOP_NAV_CONFIG = {};

export {
  CHECK_IN_TIME,
  CHECK_OUT_TIME,
  COMMAND_BAR_ROUTES,
  CUSTOMER_NAVS,
  SIDEBAR_NAV_MAIN,
  SIDEBAR_PROJECTS,
  SIDEBAR_TEAMS,
  SUPPORTED_LANGUAGES,
  TOP_NAV_CONFIG,
};
