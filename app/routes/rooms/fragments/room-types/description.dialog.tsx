import { Eye, Pencil, Save } from "lucide-react";
import { useEffect, useState } from "react";
import AlertChanges from "~/components/ui/alert-changes";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

interface DescriptionDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
  initialContent: string;
  roomTypeCode?: string;
  mode?: "preview" | "edit";
  onSave?: (content: string) => void;
}

export function DescriptionDialog({
  open,
  onClose,
  initialContent,
  roomTypeCode = "",
  mode: initialMode = "preview",
  onSave,
}: DescriptionDialogProps) {
  const [mode, setMode] = useState<"preview" | "edit">(initialMode);
  const [content, setContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(initialContent);
      setMode(initialMode);
      setIsDirty(false);
    }
  }, [open, initialContent, initialMode]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(newContent !== initialContent);
  };

  const handleClose = () => {
    if (isDirty && mode === "edit") {
      setShowUnsavedDialog(true);
    } else {
      onClose(false);
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedDialog(false);
    setIsDirty(false);
    onClose(false);
  };

  const handleSave = () => {
    onSave?.(content);
    setIsDirty(false);
    onClose(false);
  };

  const handleTabChange = (value: string) => {
    if (value === "edit" && mode === "preview") {
      setMode("edit");
    } else if (value === "preview" && mode === "edit") {
      if (isDirty) {
        setShowUnsavedDialog(true);
      } else {
        setMode("preview");
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Mô tả hạng phòng {roomTypeCode}</DialogTitle>
            <DialogDescription>
              {mode === "preview"
                ? "Xem trước nội dung mô tả"
                : "Chỉnh sửa mô tả bằng rich text editor"}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={mode}
            onValueChange={handleTabChange}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Xem trước
              </TabsTrigger>
              <TabsTrigger value="edit" className="gap-2">
                <Pencil className="h-4 w-4" />
                Chỉnh sửa
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="preview"
              className="flex-1 overflow-hidden mt-4"
            >
              <ScrollArea className="h-[400px] w-full rounded-md border bg-card">
                <div
                  className={cn(
                    "prose prose-sm max-w-none p-6",
                    "prose-headings:font-semibold",
                    "prose-p:text-muted-foreground prose-p:leading-relaxed",
                    "prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
                    "prose-li:marker:text-primary",
                    "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
                    "prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded"
                  )}
                  dangerouslySetInnerHTML={{
                    __html:
                      content ||
                      "<p class='text-muted-foreground italic'>Chưa có mô tả</p>",
                  }}
                />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="edit" className="flex-1 overflow-hidden mt-4">
              <MinimalTiptap
                content={content}
                onChange={handleContentChange}
                placeholder="Nhập mô tả chi tiết về hạng phòng..."
                editable={true}
                className="h-[400px]"
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              {mode === "edit" && isDirty ? "Hủy" : "Đóng"}
            </Button>
            {mode === "edit" && (
              <Button onClick={handleSave} disabled={!isDirty}>
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertChanges
        showCancelDialog={showUnsavedDialog}
        handleConfirmClose={handleConfirmClose}
        setShowCancelDialog={setShowUnsavedDialog}
      />
    </>
  );
}
