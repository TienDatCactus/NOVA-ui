import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Plus } from "lucide-react";

type CustomServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (service: {
    name: string;
    description?: string;
    unitPrice: number;
    quantity: number;
  }) => void;
};

export default function CustomServiceDialog({
  open,
  onOpenChange,
  onConfirm,
}: CustomServiceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    price?: string;
    quantity?: string;
  }>({});

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setQuantity("1");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập tên dịch vụ";
    } else if (name.trim().length < 2 || name.trim().length > 100) {
      newErrors.name = "Tên dịch vụ phải từ 2-100 ký tự";
    }

    if (
      description.trim() &&
      (description.trim().length < 2 || description.trim().length > 500)
    ) {
      newErrors.description = "Mô tả phải từ 2-500 ký tự";
    }

    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Vui lòng nhập giá hợp lệ";
    }

    const quantityNum = parseInt(quantity);
    if (!quantity || isNaN(quantityNum) || quantityNum <= 0) {
      newErrors.quantity = "Vui lòng nhập số lượng hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) {
      return;
    }

    onConfirm({
      name: name.trim(),
      description: description.trim() || undefined,
      unitPrice: parseFloat(price),
      quantity: parseInt(quantity),
    });

    resetForm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Thêm dịch vụ tùy chỉnh</DialogTitle>
              <DialogDescription>
                Thêm dịch vụ không có trong danh mục với giá và số lượng tùy
                chỉnh
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="service-name" className="text-sm font-medium">
              Tên dịch vụ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="service-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Ví dụ: Dịch vụ đặc biệt"
              className="w-full"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="service-description"
              className="text-sm font-medium"
            >
              Mô tả (tùy chọn)
            </Label>
            <Textarea
              id="service-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Thêm mô tả cho dịch vụ..."
              className="resize-none min-h-20"
              maxLength={500}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/500
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-price" className="text-sm font-medium">
              Đơn giá (VNĐ) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="service-price"
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setErrors((prev) => ({ ...prev, price: undefined }));
              }}
              placeholder="Nhập giá"
              min="0"
              step="1000"
              className="w-full"
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-quantity" className="text-sm font-medium">
              Số lượng <span className="text-destructive">*</span>
            </Label>
            <Input
              id="service-quantity"
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setErrors((prev) => ({ ...prev, quantity: undefined }));
              }}
              placeholder="Nhập số lượng"
              min="1"
              className="w-full"
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm vào giỏ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
