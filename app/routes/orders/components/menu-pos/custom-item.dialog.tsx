import { Plus, Info, DollarSign, Hash } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
import { cn } from "~/lib/utils";

type CustomItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (item: {
    name: string;
    description?: string;
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
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    price?: string;
    quantity?: string;
  }>({});

  // Auto-focus ref
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Slight delay to ensure dialog animation is done
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [open]);

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
      newErrors.name = "Vui lòng nhập tên món";
    } else if (name.trim().length < 2 || name.trim().length > 100) {
      newErrors.name = "Tên món phải từ 2-100 ký tự";
    }

    if (
      description.trim() &&
      (description.trim().length < 2 || description.trim().length > 500)
    ) {
      newErrors.description = "Mô tả phải từ 2-500 ký tự";
    }

    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Giá không hợp lệ";
    }

    const quantityNum = parseInt(quantity);
    if (!quantity || isNaN(quantityNum) || quantityNum <= 0) {
      newErrors.quantity = "SL không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) return;

    onConfirm({
      name: name.trim(),
      description: description.trim() || undefined,
      unitPrice: parseFloat(price),
      quantity: parseInt(quantity),
    });

    resetForm();
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden bg-background">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/5">
          <DialogTitle>Thêm món tùy chỉnh</DialogTitle>
          <DialogDescription className="text-xs">
            Tạo nhanh món không có trong thực đơn (Ad-hoc Item)
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <div className="p-6 space-y-5">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="item-name" className="text-sm font-semibold">
              Tên món <span className="text-destructive">*</span>
            </Label>
            <Input
              ref={nameInputRef}
              id="item-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name)
                  setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="VD: Phụ thu tiệc, Phí phục vụ ngoài giờ..."
              className={cn(
                errors.name &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.name && (
              <p className="text-xs text-destructive font-medium">
                {errors.name}
              </p>
            )}
          </div>

          {/* Price & Quantity Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item-price" className="text-sm font-semibold">
                Đơn giá <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="item-price"
                  type="number"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price)
                      setErrors((prev) => ({ ...prev, price: undefined }));
                  }}
                  placeholder="0"
                  min="0"
                  className={cn("pl-9", errors.price && "border-destructive")}
                />
              </div>
              {errors.price && (
                <p className="text-xs text-destructive font-medium">
                  {errors.price}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-quantity" className="text-sm font-semibold">
                Số lượng <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="item-quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (errors.quantity)
                      setErrors((prev) => ({ ...prev, quantity: undefined }));
                  }}
                  placeholder="1"
                  min="1"
                  className={cn(
                    "pl-9",
                    errors.quantity && "border-destructive"
                  )}
                />
              </div>
              {errors.quantity && (
                <p className="text-xs text-destructive font-medium">
                  {errors.quantity}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="item-description" className="text-sm font-semibold">
              Ghi chú / Mô tả
            </Label>
            <Textarea
              id="item-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chi tiết thêm về món này..."
              className="resize-none min-h-[80px] text-sm"
              maxLength={500}
            />
            <div className="flex justify-end">
              <span className="text-[10px] text-muted-foreground">
                {description.length}/500
              </span>
            </div>
          </div>

          {/* Info Alert */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-blue-700">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold">Lưu ý:</span> Món này chỉ tồn tại
              trong đơn hàng hiện tại và sẽ không được lưu vào danh mục thực đơn
              chính.
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/5 sm:justify-between items-center">
          <div className="hidden sm:block text-xs text-muted-foreground">
            Nhấn{" "}
            <kbd className="px-1 py-0.5 bg-muted border rounded text-[10px] font-mono">
              Enter
            </kbd>{" "}
            để xác nhận
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 sm:flex-none min-w-[100px]"
            >
              Thêm món
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
