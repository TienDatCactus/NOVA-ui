import type { ItemCategoriesListDto } from "~/services/api/stocks/item-category/dto";
import { columns } from "./columns";
import DataTable from "./data-table";

interface ItemCategoriesListProps {
  data: ItemCategoriesListDto;
}

export default function ItemCategoriesList({ data }: ItemCategoriesListProps) {
  return (
    <div className="container mx-auto">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
