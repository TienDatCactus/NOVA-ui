import type { StaffRoleItem } from "~/services/api/staff/staff-role/dto";
import { columns } from "./columns";
import DataTable from "./data-table";

interface StaffRolesListProps {
  data: StaffRoleItem[];
}

export default function StaffRolesList({ data }: StaffRolesListProps) {
  return <DataTable columns={columns} data={data} />;
}
