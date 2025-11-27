import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Layers, Package, Save } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type z from "zod";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { onError } from "~/lib/utils";
import { useStockItemList } from "~/routes/stocks/items/container/query.hooks";
import { useUnits } from "~/routes/units/container/unit-query.hooks";
import { MenuSchema } from "~/services/api/menu/menu.schema";
import { useMenuCategories } from "../container/menu-categories/query.hooks";
import { useCreateMenuItem } from "../container/menu/mutation.hooks";
import ComponentsTab from "../fragments/menu/create/components-tab";
import GeneralTab from "../fragments/menu/create/general-tab";
import MediaTab from "../fragments/menu/create/media-tab";

const { CreateMenuItemRequestSchema } = MenuSchema;
export type CreateMenuFormData = z.infer<typeof CreateMenuItemRequestSchema>;

interface CreateMenuDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateMenuDialog({
  open,
  onClose,
}: CreateMenuDialogProps) {
  // --- State ---
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm<CreateMenuFormData>({
    resolver: zodResolver(CreateMenuItemRequestSchema) as any,
    defaultValues: {
      CategoryId: "",
      Code: "",
      Name: "",
      Description: "",
      UnitId: "",
      Price: 0,
      Active: true,
      Images: [],
      Components: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "Components",
  });

  // --- Queries ---
  const { mutate: createMenuItem, isPending } = useCreateMenuItem();
  const { data: categories } = useMenuCategories();
  const { data: units } = useUnits();
  const { data: stockItems } = useStockItemList({ includeInactive: false });

  const handleRemoveImage = (index: number) => {
    const currentImgs = form.getValues("Images") || [];
    const newImgs = currentImgs.filter((_, i) => i !== index);
    form.setValue("Images", newImgs);
    form.clearErrors("Images");

    URL.revokeObjectURL(imagePreview[index]);
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (data: CreateMenuFormData) => {
    createMenuItem(data, { onSuccess: handleClose });
  };

  const handleClose = () => {
    imagePreview.forEach((url) => URL.revokeObjectURL(url));
    setImagePreview([]);
    form.reset();
    setActiveTab("general");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col gap-0 p-0 ">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="space-y-1">
            <DialogTitle className="text-xl">Thêm món mới</DialogTitle>
            <DialogDescription>
              Khai báo thông tin món ăn vào hệ thống thực đơn.
            </DialogDescription>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, onError)}
            className="flex flex-col "
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col h-full"
            >
              <TabsList className="h-12 gap-6 w-full">
                <TabsTrigger value="general">
                  <Package className="w-4 h-4 mr-2" /> Thông tin chung
                </TabsTrigger>
                <TabsTrigger value="media">
                  <ImageIcon className="w-4 h-4 mr-2" /> Hình ảnh
                  {imagePreview.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 px-1.5 py-0 h-5 text-[10px]"
                    >
                      {imagePreview.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="components">
                  <Layers className="w-4 h-4 mr-2" /> Định lượng
                  {fields.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 px-1.5 py-0 h-5 text-[10px]"
                    >
                      {fields.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                {/* --- TAB 1: GENERAL --- */}
                <GeneralTab
                  form={form}
                  menuCategories={categories}
                  units={units}
                />

                <MediaTab
                  imagePreview={imagePreview}
                  handleRemoveImage={handleRemoveImage}
                  formErrors={form.formState.errors.Images}
                  onDrop={(acceptedFiles: File[]) => {
                    const currentImgs = form.getValues("Images") || [];
                    const totalImgs = currentImgs.length + acceptedFiles.length;
                    if (totalImgs > 8) {
                      return;
                    }
                    const newImgs = [...currentImgs, ...acceptedFiles];
                    form.setValue("Images", newImgs);
                    setImagePreview((prev) => [
                      ...prev,
                      ...acceptedFiles.map((file) => URL.createObjectURL(file)),
                    ]);
                  }}
                />

                {/* --- TAB 3: COMPONENTS --- */}
                <ComponentsTab
                  form={form}
                  fields={fields}
                  append={append}
                  remove={remove}
                  stockItems={stockItems}
                />
              </div>
            </Tabs>

            <DialogFooter className="p-6 pt-4 border-t shrink-0">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
                type="button"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />{" "}
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Tạo món
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
