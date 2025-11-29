import { useState } from "react";
import { Textarea } from "~/components/ui/textarea";
import { useUpdatePOSOrderNote } from "../../container/pos-orders/mutation.hooks";
import { toast } from "sonner";

interface InlineNoteEditorProps {
  orderId: string;
  initialNote: string | null;
  disabled?: boolean;
}

export default function InlineNoteEditor({
  orderId,
  initialNote,
  disabled = false,
}: InlineNoteEditorProps) {
  const [note, setNote] = useState(initialNote || "");
  const [isSaving, setIsSaving] = useState(false);
  const { mutate: updateNote } = useUpdatePOSOrderNote();

  const handleBlur = () => {
    // Only save if note has changed
    if (note !== (initialNote || "")) {
      setIsSaving(true);
      updateNote(
        { orderId, note },
        {
          onSuccess: () => {
            toast.success("Đã cập nhật ghi chú");
            setIsSaving(false);
          },
          onError: () => {
            toast.error("Không thể cập nhật ghi chú");
            setNote(initialNote || ""); // Revert to original
            setIsSaving(false);
          },
        }
      );
    }
  };

  if (disabled) {
    return <p className="text-sm break-words">{initialNote || "Không có"}</p>;
  }

  return (
    <Textarea
      value={note}
      onChange={(e) => setNote(e.target.value)}
      onBlur={handleBlur}
      placeholder="Nhập ghi chú..."
      className="min-h-[60px] text-sm resize-none"
      disabled={isSaving}
    />
  );
}
