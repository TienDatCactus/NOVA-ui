import type { UseFormReturn } from "react-hook-form";
import { Plus, Layers, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
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
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { Textarea } from "~/components/ui/textarea";

interface ComponentsTabProps {
  form: UseFormReturn<any>;
  fields: any[];
  append: (value: any) => void;
  remove: (index: number) => void;
  stockItems?: StockItemsListItemDto[];
}

const ComponentsTab: React.FC<ComponentsTabProps> = ({
  form,
  fields,
  append,
  remove,
  stockItems,
}) => {
  return (
    <TabsContent value="components" className="mt-0 outline-none">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Công thức định lượng</h4>
          <p className="text-xs text-muted-foreground">
            Trừ kho tự động khi bán món này.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            append({
              itemId: "",
              itemCode: "",
              itemName: "",
              quantity: 1,
              notes: "",
            })
          }
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Thêm dòng
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg bg-muted/5">
          <Layers className="w-10 h-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">
            Chưa có nguyên liệu nào
          </p>
          <Button
            variant="link"
            onClick={() =>
              append({
                itemId: "",
                itemCode: "",
                itemName: "",
                quantity: 1,
                notes: "",
              })
            }
          >
            Thêm nguyên liệu đầu tiên
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table className="w-full text-sm">
            <TableHeader className="bg-muted/30 text-muted-foreground font-medium">
              <TableRow>
                <TableHead className="text-left py-3 px-4 font-medium w-[50%]">
                  Nguyên liệu
                </TableHead>
                <TableHead className="text-left py-3 px-4 font-medium w-[20%]">
                  Số lượng
                </TableHead>
                <TableHead className="text-left py-3 px-4 font-medium w-[20%]">
                  Ghi chú
                </TableHead>
                <TableHead className="w-[10%]"></TableHead>
              </TableRow>
            </TableHeader>
            <tbody className="divide-y">
              {fields.map((field, index) => (
                <TableRow
                  key={field.id}
                  className="group bg-background hover:bg-muted/5"
                >
                  <td className="p-3 pl-4">
                    <FormField
                      control={form.control}
                      name={`Components.${index}.itemId`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val);
                              const item = stockItems?.find(
                                (i) => i.id === val
                              );
                              if (item) {
                                form.setValue(
                                  `Components.${index}.itemCode`,
                                  item.code
                                );
                                form.setValue(
                                  `Components.${index}.itemName`,
                                  item.name
                                );
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9 border-transparent bg-transparent hover:bg-muted/10 focus:bg-background focus:border-input">
                                <SelectValue placeholder="Chọn nguyên liệu" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stockItems?.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  <div className="flex items-center justify-between w-full gap-2">
                                    <span>{item.name}</span>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {item.unitName}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="p-3">
                    <FormField
                      control={form.control}
                      name={`Components.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || val === "-") {
                                  field.onChange(0);
                                } else {
                                  const numVal = parseFloat(val);
                                  if (!isNaN(numVal) && numVal >= 0) {
                                    field.onChange(numVal);
                                  }
                                }
                              }}
                              onBlur={field.onBlur}
                              min={0}
                              step={0.1}
                              className="h-9 border-transparent bg-transparent hover:bg-muted/10 focus:bg-background focus:border-input text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="p-3">
                    <FormField
                      control={form.control}
                      name={`Components.${index}.notes`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              placeholder="..."
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.value || "")
                              }
                              onBlur={field.onBlur}
                              className="h-9 border-transparent bg-transparent hover:bg-muted/10 focus:bg-background focus:border-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </TabsContent>
  );
};

export default ComponentsTab;
