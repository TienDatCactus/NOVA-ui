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
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

type ItemCustomizationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  currentNotes?: string;

  onSave: (notes: string) => void;
};

export default function ItemCustomizationDialog({
  open,
  onOpenChange,
  itemName,
  currentNotes = "",
  onSave,
}: ItemCustomizationDialogProps) {
  const [notes, setNotes] = useState(currentNotes);

  const handleSave = () => {
    onSave(notes);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to current values
    setNotes(currentNotes);
    const resetMap = new Map<string, boolean>();

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa món</DialogTitle>
          <DialogDescription>{itemName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-semibold">
            Ghi chú đặc biệt
          </Label>
          <Textarea
            id="notes"
            placeholder="Ví dụ: Ít cay, không hành..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">
            {notes.length}/200
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
