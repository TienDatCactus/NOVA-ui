import { ScanBarcode } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import type z from "zod";
import {
  FormControl,
  FormDescription,
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
import { Switch } from "~/components/ui/switch";
import { TabsContent } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import type { MenuCategoryItemDto } from "~/services/api/menu-category/dto";
import { UnitSchema } from "~/services/api/units/unit.schema";

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
        <div className="space-y-2">
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
                    placeholder="Ví dụ: Cơm Chiên Dương Châu"
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
                    startAddon={
                      <ScanBarcode className=" h-4 w-4 text-muted-foreground" />
                    }
                    className="font-mono uppercase"
                    placeholder="FOOD-NEW"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Chỉ chứa chữ IN HOA, số, gạch ngang (-) và gạch dưới (_)
                </FormDescription>
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
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || val === "-") {
                        field.onChange(undefined);
                      } else {
                        const numVal = parseInt(val, 10);
                        if (!isNaN(numVal)) {
                          field.onChange(numVal);
                        }
                      }
                    }}
                    onBlur={field.onBlur}
                    min={0}
                    startAddon={
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
        </div>

        <div className="space-y-2">
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
                    <SelectTrigger className="w-40">
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
            name="UnitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Đơn vị tính <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-40">
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
                    placeholder="Mô tả chi tiết món ăn..."
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <FormField
        control={form.control}
        name="Active"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="scale-75"
                  id="menu-item-active-switch"
                />
                <div className="grid grow gap-2">
                  <FormLabel
                    className="text-xs font-medium cursor-pointer flex-col items-start mb-0 pb-0"
                    htmlFor="menu-item-active-switch"
                  >
                    <p>{field.value ? "Đang bán" : "Tạm ngưng"}</p>
                    <p className="text-muted-foreground text-xs">
                      Chọn "Tạm ngưng" để ẩn món ăn này khỏi thực đơn POS.
                    </p>
                  </FormLabel>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </TabsContent>
  );
};

export default GeneralTab;
