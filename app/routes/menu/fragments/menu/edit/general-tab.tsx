import type { UseFormReturn } from "react-hook-form";
import { ScanBarcode } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { TabsContent } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import type { MenuCategoryItemDto } from "~/services/api/menu-category/dto";
import { UnitSchema } from "~/services/api/units/unit.schema";
import type z from "zod";

const { UnitItemSchema } = UnitSchema;
type UnitItem = z.infer<typeof UnitItemSchema>;

interface GeneralTabProps {
  form: UseFormReturn<any>;
  menuCategories?: MenuCategoryItemDto[];
  units?: UnitItem[];
}

const GeneralTab: React.FC<GeneralTabProps> = ({
  form,
  menuCategories,
  units,
}) => {
  return (
    <TabsContent value="general" className="mt-0 space-y-6 outline-none">
      <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="Name"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>
                Tên món ăn <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="font-medium text-lg"
                  placeholder="Ví dụ: Phở Bò Đặc Biệt"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Mã SKU <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="pl-8 font-mono"
                  placeholder="FOOD-001"
                  {...field}
                  startAddon={
                    <ScanBarcode className="h-4 w-4 text-muted-foreground" />
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="CategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Danh mục <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {menuCategories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Giá bán <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className="font-semibold text-right"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  endAddon={
                    <span className="text-muted-foreground text-xs font-bold">
                      VND
                    </span>
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="UnitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Đơn vị tính <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đơn vị" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {units?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Description"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả thành phần, hương vị..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </TabsContent>
  );
};

export default GeneralTab;
