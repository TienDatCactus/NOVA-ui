import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { DialogFooter } from "~/components/ui/dialog";
import { Divider } from "~/components/ui/divider";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Switch } from "~/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Combobox } from "../fragments/room-breakfast-combobox.fragment";
import RoomDataTable from "../fragments/room-data-table.fragment";

function RoomSelectionForm() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string[] | undefined>([]);
  const [breakfast, setBreakfast] = useState(false);
  const onValueChange = (values: string[]) => setValue(values);

  return (
    <>
      <ScrollArea className="h-120 min-h-0">
        <div className="space-y-6 w-full">
          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger>
              <p className="text-sm hover:underline">
                Gợi ý 1 phòng cho (1 người lớn)
              </p>
              <ChevronDown />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <RoomDataTable />
            </CollapsibleContent>
          </Collapsible>
          <Divider weight="thin" className="mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4">
            <div className="md:col-span-3 col-span-1">
              <Table>
                <TableCaption> Lựa chọn phòng khác.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Phòng</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow key={"1"}>
                    <TableCell>
                      <h1>U no reverse</h1>
                      <p className="text-sm text-muted-foreground">
                        Phòng Deluxe Giường Đôi
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <data>$2,500.00</data>
                    </TableCell>
                    <TableCell className="flex flex-col items-end justify-end">
                      <div className="w-16">
                        <Input
                          type="number"
                          defaultValue={0}
                          min={0}
                          max={13}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="md:col-span-1 col-span-1 flex h-full justify-center items-center gap-3 border-l pl-4">
              <div className="space-y-4">
                <div className="flex gap-2 items-center justify-center">
                  <Switch
                    onCheckedChange={() => setBreakfast(!breakfast)}
                    id="breakfast"
                  />
                  <Label htmlFor="breakfast">Bữa sáng</Label>
                </div>
                <Combobox
                  onChange={onValueChange}
                  value={value ?? []}
                  open={open}
                  onOpenChange={setOpen}
                  disabled={breakfast}
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter>
        <div className="flex gap-2 items-center">
          <Button variant="outline">Quay lại</Button>
          <Button>Xác nhận</Button>
        </div>
      </DialogFooter>
    </>
  );
}

export default RoomSelectionForm;
