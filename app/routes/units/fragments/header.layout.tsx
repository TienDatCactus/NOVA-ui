import { CheckCircle2, Package, Plus, XCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

interface UnitsHeaderProps {
  totalUnits: number;
  activeUnits: number;
  inactiveUnits: number;
  onAddUnit: () => void;
}

function UnitsHeader({
  totalUnits,
  activeUnits,
  inactiveUnits,
  onAddUnit,
}: UnitsHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold">Quản lý đơn vị tính</h1>
          <p className="text-muted-foreground">
            Tổng{" "}
            <span className="font-semibold text-foreground">{totalUnits}</span>{" "}
            đơn vị
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onAddUnit} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm đơn vị tính
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Đang hoạt động
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeUnits}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-400 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ngừng hoạt động
                </p>
                <p className="text-2xl font-bold text-gray-600">
                  {inactiveUnits}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tổng đơn vị
                </p>
                <p className="text-2xl font-bold">{totalUnits}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default UnitsHeader;
