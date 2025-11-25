import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Layers, Package, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type z from "zod";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { useStockItemList } from "~/routes/stocks/items/container/query.hooks";
import { useUnits } from "~/routes/units/container/unit-query.hooks";
import type { MenuListItemDto } from "~/services/api/menu/dto";
import { MenuSchema } from "~/services/api/menu/menu.schema";
import { useMenuCategories } from "../container/menu-categories/query.hooks";
import { useUpdateMenuItem } from "../container/menu/mutation.hooks";
import { useMenuItemDetail } from "../container/menu/query.hooks";
import ComponentsTab from "../fragments/menu/edit/components-tab";
import GeneralTab from "../fragments/menu/edit/general-tab";
import MediaTab from "../fragments/menu/edit/media-tab";
import { onError } from "~/lib/utils";

const { UpdateMenuItemRequestSchema } = MenuSchema;
type UpdateMenuFormData = z.infer<typeof UpdateMenuItemRequestSchema>;

interface EditMenuSheetProps {
  open: boolean;
  onClose: () => void;
  menuItem: MenuListItemDto;
}

export default function EditMenuSheet({
  open,
  onClose,
  menuItem,
}: EditMenuSheetProps) {
  // --- State & Hooks ---
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [removeMediaIds, setRemoveMediaIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm({
    resolver: zodResolver(UpdateMenuItemRequestSchema),
    defaultValues: {
      CategoryId: "",
      Code: "",
      Name: "",
      Description: "",
      UnitId: "",
      Price: 0,
      Active: true,
      RemoveMediaIds: [],
      NewImages: [],
      Components: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "Components",
  });

  // --- Queries ---
  const { data: menuItemDetail, isPending: isLoadingDetail } =
    useMenuItemDetail(menuItem.itemId, { enabled: open });
  const { mutate: updateMenuItem, isPending: isUpdating } = useUpdateMenuItem(
    menuItem.itemId
  );
  const { data: menuCategories, isPending: isLoadingCategories } =
    useMenuCategories();
  const { data: units, isPending: isLoadingUnits } = useUnits();
  const { data: stockItems } = useStockItemList({ includeInactive: false });

  useEffect(() => {
    if (menuItem && menuItemDetail && menuCategories && units) {
      form.reset({
        CategoryId: menuItemDetail.categoryId || "",
        Code: menuItemDetail.code,
        Name: menuItemDetail.name,
        Description: menuItemDetail.description || "",
        UnitId: menuItemDetail.unitId || "",
        Price: menuItemDetail.price,
        Active: menuItemDetail.active,
        RemoveMediaIds: [],
        NewImages: [],
        Components: menuItemDetail.components.map((comp) => ({
          itemId: comp.itemId,
          quantity: comp.quantity,
          notes: comp.notes || "",
        })),
      });
      setRemoveMediaIds([]);
      setNewFiles([]);
      setNewPreviews([]);
    }
  }, [menuItem, menuItemDetail, menuCategories, units, form]);

  useEffect(() => {
    form.setValue("NewImages", newFiles as any);
    form.setValue("RemoveMediaIds", removeMediaIds);
  }, [newFiles, removeMediaIds, form]);

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setNewPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

  const handleSubmit = (data: UpdateMenuFormData) => {
    updateMenuItem(
      { ...data, RemoveMediaIds: removeMediaIds, NewImages: newFiles },
      { onSuccess: handleClose }
    );
  };

  const handleClose = () => {
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewPreviews([]);
    setNewFiles([]);
    setRemoveMediaIds([]);
    setActiveTab("general");
    form.reset();
    onClose();
  };

  const toggleRemoveExisting = (id: string) => {
    setRemoveMediaIds((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  // --- Render Loading ---
  if (isLoadingDetail || isLoadingCategories || isLoadingUnits) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-2xl p-0">
          <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-2xl w-full gap-0 p-0 flex flex-col bg-card">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <div className="space-y-1">
            <SheetTitle className="text-xl">Chỉnh sửa món</SheetTitle>
            <SheetDescription>
              Cập nhật thông tin chi tiết cho{" "}
              <span className="font-semibold text-foreground">
                {menuItem.name}
              </span>
            </SheetDescription>
          </div>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, onError)}
            className="flex flex-col h-full"
          >
            {/* === TABS & BODY === */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col min-h-0"
            >
              <TabsList className=" h-12 w-full">
                <TabsTrigger value="general">
                  <Package className="w-4 h-4 mr-2" /> Thông tin chung
                </TabsTrigger>
                <TabsTrigger value="media">
                  <ImageIcon className="w-4 h-4 mr-2" /> Hình ảnh
                  {(newFiles.length > 0 ||
                    (menuItemDetail?.images?.length || 0) > 0) && (
                    <Badge
                      variant="secondary"
                      className="ml-2 px-1 py-0 h-5 text-[10px]"
                    >
                      {(menuItemDetail?.images?.length || 0) +
                        newFiles.length -
                        removeMediaIds.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="components">
                  <Layers className="w-4 h-4 mr-2" /> Định lượng (Recipe)
                  {fields.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 px-1 py-0 h-5 text-[10px]"
                    >
                      {fields.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <div className="p-6">
                  <GeneralTab
                    form={form}
                    menuCategories={menuCategories}
                    units={units}
                  />

                  <MediaTab
                    menuItemDetail={menuItemDetail}
                    newFiles={newFiles}
                    newPreviews={newPreviews}
                    removeMediaIds={removeMediaIds}
                    toggleRemoveExisting={toggleRemoveExisting}
                    onDrop={(acceptedFiles) => {
                      setNewFiles((prev) => [...prev, ...acceptedFiles]);
                    }}
                  />

                  <ComponentsTab
                    form={form}
                    fields={fields}
                    append={append}
                    remove={remove}
                    stockItems={stockItems}
                  />
                </div>
              </ScrollArea>
            </Tabs>

            {/* === FOOTER === */}
            <SheetFooter className="p-6 pt-4 border-t shrink-0 bg-background">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isUpdating}
                type="button"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="min-w-[140px]"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />{" "}
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
