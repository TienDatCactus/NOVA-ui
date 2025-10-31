import { MenuItemsDataTable } from "./data-table";
import { getColumns } from "./columns";
import type { MenuItem } from "~/services/api/menu-item/dto";

interface MenuItemsListProps {
  data: MenuItem[];
  onEdit: (menuItem: MenuItem) => void;
  onDelete: (menuItem: MenuItem) => void;
}

export default function MenuItemsList({ data, onEdit, onDelete }: MenuItemsListProps) {
  const columns = getColumns({ onEdit, onDelete });
  return <MenuItemsDataTable columns={columns} data={data} />;
}
