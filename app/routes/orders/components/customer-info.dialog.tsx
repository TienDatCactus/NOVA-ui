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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { User } from "lucide-react";

type CustomerInfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (customer: { name: string; phone?: string }) => void;
};

export default function CustomerInfoDialog({
  open,
  onOpenChange,
  onSave,
}: CustomerInfoDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      return; // Name is required
    }

    onSave({
      name: name.trim(),
      phone: phone.trim() || undefined,
    });

    // Reset form
    setName("");
    setPhone("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setName("");
    setPhone("");
    onOpenChange(false);
  };

  const isValid = name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Thông tin khách hàng</DialogTitle>
              <DialogDescription>
                Nhập thông tin khách lẻ (Walk-in)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="customer-name">
              Họ và tên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customer-name"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <Label htmlFor="customer-phone">Số điện thoại (tùy chọn)</Label>
            <Input
              id="customer-phone"
              type="tel"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={15}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
