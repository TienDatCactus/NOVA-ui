import { useNavigate } from "react-router";
import { toast } from "sonner";
import CreateItemForm from "./components/create-item-form";
import { useCreateStockItem } from "./container/items.query.hooks";
import type { FormSchema } from "~/services/schema/forms.schema";
import type z from "zod";
export type CreateItemFormData = z.infer<
  typeof FormSchema.CreateItemFormSchema
>;

// Mock data - cần thay bằng API thật sau
const MOCK_CATEGORIES = [
  { id: "1", name: "Đồ uống" },
  { id: "2", name: "Thực phẩm" },
  { id: "3", name: "Vật tư khách sạn" },
  { id: "4", name: "Vật tư vệ sinh" },
];

const MOCK_UNITS = [
  { id: "1", code: "CAI", name: "Cái" },
  { id: "2", code: "LOC", name: "Lốc" },
  { id: "3", code: "THUNG", name: "Thùng" },
  { id: "4", code: "KG", name: "Kilogram" },
  { id: "5", code: "LITER", name: "Lít" },
];

export default function CreateStockItemPage() {
  const navigate = useNavigate();
  const createMutation = useCreateStockItem();

  const handleSubmit = (data: CreateItemFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Tạo hàng hóa thành công");
        navigate("/dashboard/stocks/items");
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Có lỗi xảy ra khi tạo hàng hóa"
        );
      },
    });
  };

  return (
    <CreateItemForm
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending}
      categories={MOCK_CATEGORIES}
      units={MOCK_UNITS}
    />
  );
}
