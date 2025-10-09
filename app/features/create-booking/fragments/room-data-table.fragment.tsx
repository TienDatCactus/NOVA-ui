import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "~/components/ui/table";
import { ROOM_TYPE } from "~/lib/constants";

export default function RoomDataTable({
  ...props
}: React.ComponentProps<"table">) {
  return (
    <Table {...props}>
      <TableHeader>
        <TableRow className="h-16 ">
          <TableHead className="w-20 rounded-s-md">Ảnh</TableHead>
          <TableHead>
            <Select>
              <SelectTrigger id="room-type" className="w-32 bg-white">
                <SelectValue placeholder="Loại phòng" />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPE.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableHead>
          <TableHead className="text-center w-24">Giá</TableHead>
          <TableHead className="text-center w-24">Số lượng</TableHead>
          <TableHead className="text-center w-24 rounded-e-md">
            Tổng cộng
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow key={"1"}>
          <TableCell className="font-medium">
            <div className="aspect-square w-24 rounded-md bg-gray-100 mb-2 cursor-pointer">
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                Product Image
              </div>
            </div>
          </TableCell>
          <TableCell>
            <h1>U no reverse</h1>
            <p className="text-sm text-muted-foreground">
              Phòng Deluxe Giường Đôi
            </p>
          </TableCell>
          <TableCell className="text-center">
            <Badge variant={"default"}>$2,500.00</Badge>
          </TableCell>
          <TableCell className="text-center">2</TableCell>
          <TableCell className="text-center space-y-2">
            <data className="block">$2,500.00</data>
            <Button className="w-fit">Đặt phòng</Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
