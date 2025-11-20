import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import EditItemForm from "./components/edit-item-form";
import {
  useStockItemDetail,
  useUpdateStockItem,
} from "./container/items.query.hooks";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import type z from "zod";
import type { FormSchema } from "~/services/schema/forms.schema";
export type UpdateItemFormData = z.infer<
  typeof FormSchema.UpdateItemFormSchema
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

export default function EditStockItemPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Early return if no id
  if (!id) {
    toast.error("ID hàng hóa không hợp lệ");
    navigate("/dashboard/stocks/items");
    return null;
  }

  const { data: item, isPending, isError } = useStockItemDetail(id);
  const updateMutation = useUpdateStockItem();

  const handleSubmit = (data: UpdateItemFormData) => {
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success("Cập nhật hàng hóa thành công");
          navigate("/dashboard/stocks/items");
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "Có lỗi xảy ra khi cập nhật hàng hóa"
          );
        },
      }
    );
  };

  if (isPending) {
    return <LoadingSkeleton />;
  }

  if (isError || !item) {
    toast.error("Không tìm thấy hàng hóa");
    navigate("/dashboard/stocks/items");
    return null;
  }

  return (
    <EditItemForm
      initialData={item}
      onSubmit={handleSubmit}
      isSubmitting={updateMutation.isPending}
      categories={MOCK_CATEGORIES}
      units={MOCK_UNITS}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
