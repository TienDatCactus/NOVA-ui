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
    id: 3,
    title: "Khách hàng",
    icon: <Users />,
    href: "/dashboard/customers",
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

const RESERVATION_NAV_ITEMS: Array<{
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

const ROOM_TYPE = ["Traditional", "Romantic", "Unique", "Chalet"];
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
const rowHeight = 64; // increased cell height for readability
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
  RESERVATION_NAV_ITEMS,
  ROOM_TYPE,
  BOOKING_CHANNEL,
  SERVICE_CATEGORIES,
};
