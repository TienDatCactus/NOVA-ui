import { Layers, Plus, Trash2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { TabsContent } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";

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
            Trừ kho nguyên liệu tự động khi bán món này.
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
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Thêm nguyên liệu
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/5">
          <Layers className="w-10 h-10 text-muted-foreground/20 mb-2" />
          <p className="text-sm text-muted-foreground">
            Chưa có thành phần nào
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table className="w-full text-sm">
            <TableHeader className="bg-muted/30 text-muted-foreground font-medium">
              <TableRow>
                <TableHead className="text-left font-medium">
                  Nguyên liệu
                </TableHead>
                <TableHead className="text-left font-medium w-80">
                  Ghi chú
                </TableHead>
                <TableHead className="text-left w-60 font-medium">
                  Số lượng
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <tbody className="divide-y">
              {fields.map((field, index) => (
                <TableRow
                  key={field.id}
                  className="group bg-background hover:bg-muted/5"
                >
                  <TableCell className="">
                    <FormField
                      control={form.control}
                      name={`Components.${index}.itemId`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Select
                              onValueChange={(val) => {
                                field.onChange(val);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-40">
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className=" text-center">
                    <FormField
                      control={form.control}
                      name={`Components.${index}.notes`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Textarea
                              placeholder="Ghi chú thêm..."
                              className="min-h-[38px] resize-none"
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className=" text-center">
                    <FormField
                      control={form.control}
                      name={`Components.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Counter
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="p-3 text-center align-top">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
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
