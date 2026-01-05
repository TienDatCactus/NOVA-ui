import type { UseFormReturn, FieldArrayWithId } from "react-hook-form";
import { Plus, ScanBarcode, X } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
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
import { Switch } from "~/components/ui/switch";

const { UnitItemSchema } = UnitSchema;
type UnitItem = z.infer<typeof UnitItemSchema>;

interface GeneralTabProps {
  form: UseFormReturn<any>;
  menuCategories?: MenuCategoryItemDto[];
  units?: UnitItem[];
  translationFields?: FieldArrayWithId<any, "translations", "id">[];
  handleAddTranslation?: () => void;
  handleRemoveTranslation?: (index: number) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({
  form,
  menuCategories,
  units,
  translationFields = [],
  handleAddTranslation,
  handleRemoveTranslation,
}) => {
  return (
    <TabsContent value="general" className="mt-0 space-y-6 outline-none">
      {/* Translations Section */}
      <div className="space-y-4">
        {translationFields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-4 p-4 border rounded-lg bg-muted/10"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                Ngôn ngữ:{" "}
                {(translationFields[index] as any).languageCode === "vi"
                  ? "Tiếng Việt"
                  : (translationFields[index] as any).languageCode === "en"
                    ? "English"
                    : (
                        (translationFields[index] as any).languageCode || ""
                      ).toUpperCase()}
              </h4>
              {translationFields.length > 1 && handleRemoveTranslation && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTranslation(index)}
                  className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <FormField
              control={form.control}
              name={`translations.${index}.languageCode`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã ngôn ngữ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="vi, en, fr, de..."
                      className="font-mono uppercase"
                      maxLength={5}
                      {...field}
                      disabled={index === 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`translations.${index}.name`}
              render={({ field }) => (
                <FormItem>
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
              name={`translations.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về món ăn..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        {handleAddTranslation && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddTranslation}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm ngôn ngữ khác
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
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
                    value={field.value || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || val === "-") {
                        field.onChange(0);
                      } else {
                        const numVal = parseInt(val, 10);
                        if (!isNaN(numVal)) {
                          field.onChange(numVal);
                        }
                      }
                    }}
                    onBlur={field.onBlur}
                    min={0}
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
            name="Code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Mã SKU <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="font-mono"
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
        </div>
        <div className="grid gap-2">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="CategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Danh mục <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    key={field.value || "category-select"}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
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
                  <Select
                    key={field.value || "unit-select"}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
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
          </div>
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
