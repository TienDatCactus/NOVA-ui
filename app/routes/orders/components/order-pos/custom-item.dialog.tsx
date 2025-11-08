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
import { Plus } from "lucide-react";

type CustomItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (item: {
    name: string;
    unitPrice: number;
    quantity: number;
  }) => void;
};

export default function CustomItemDialog({
  open,
  onOpenChange,
  onConfirm,
}: CustomItemDialogProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    quantity?: string;
  }>({});

  const resetForm = () => {
    setName("");
    setPrice("");
    setQuantity("1");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập tên món";
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
              <DialogTitle>Thêm món tùy chỉnh</DialogTitle>
              <DialogDescription>
                Thêm món không có trong menu với giá và số lượng tùy chỉnh
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="item-name" className="text-sm font-medium">
              Tên món <span className="text-destructive">*</span>
            </Label>
            <Input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Ví dụ: Món đặc biệt"
              className="w-full"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-price" className="text-sm font-medium">
              Đơn giá (VNĐ) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="item-price"
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
            <Label htmlFor="item-quantity" className="text-sm font-medium">
              Số lượng <span className="text-destructive">*</span>
            </Label>
            <Input
              id="item-quantity"
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

          <div className="bg-muted/30 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Lưu ý:</strong> Món tùy chỉnh sẽ không được lưu vào
              menu. Chỉ áp dụng cho đơn hàng này.
            </p>
          </div>
        </div>

        <DialogFooter>
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
