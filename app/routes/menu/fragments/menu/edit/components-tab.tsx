import { Layers, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
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
import { cn } from "~/lib/utils";

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
  const [openPopovers, setOpenPopovers] = useState<{ [key: number]: boolean }>(
    {}
  );

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

      {(form.formState.errors.Components?.message || fields.length === 0) && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive font-medium">
            {(form.formState.errors.Components?.message as string) ||
              "Vui lòng thêm ít nhất 1 nguyên liệu vào công thức định lượng"}
          </p>
        </div>
      )}

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
                          <Popover
                            open={openPopovers[index]}
                            onOpenChange={(open) =>
                              setOpenPopovers((prev) => ({
                                ...prev,
                                [index]: open,
                              }))
                            }
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? stockItems?.find(
                                        (item) => item.id === field.value
                                      )?.name
                                    : "Chọn nguyên liệu"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[300px] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput placeholder="Tìm nguyên liệu..." />
                                <CommandList>
                                  <CommandEmpty>
                                    Không tìm thấy nguyên liệu.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {stockItems?.map((item) => {
                                      const isSelected =
                                        form
                                          .getValues("Components")
                                          .some(
                                            (cmp: any) => cmp.itemId === item.id
                                          ) && field.value !== item.id;

                                      return (
                                        <CommandItem
                                          key={item.id}
                                          value={item.name}
                                          disabled={isSelected}
                                          onSelect={() => {
                                            field.onChange(item.id);
                                            form.setValue(
                                              `Components.${index}.itemCode`,
                                              item.code
                                            );
                                            form.setValue(
                                              `Components.${index}.itemName`,
                                              item.name
                                            );
                                            setOpenPopovers((prev) => ({
                                              ...prev,
                                              [index]: false,
                                            }));
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === item.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          <div className="flex items-center justify-between w-full gap-2">
                                            <span>{item.name}</span>
                                            <span className="text-xs text-muted-foreground font-mono">
                                              {item.unitName}
                                            </span>
                                          </div>
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
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
