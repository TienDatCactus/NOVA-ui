import {
  Bath,
  ClipboardMinus,
  Handshake,
  IdCardLanyard,
  LayoutDashboard,
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

export { NAV_ITEMS, SERVICES_ITEMS };
