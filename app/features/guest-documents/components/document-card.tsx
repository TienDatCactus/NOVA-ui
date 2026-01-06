import { format, parseISO, differenceInMonths } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  Eye,
  Globe,
  IdCard,
  MoreVertical,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import type { BookingDocumentItemDto } from "~/services/api/guest-documents/dto";

interface DocumentCardProps {
  document: BookingDocumentItemDto;
  onView?: (document: BookingDocumentItemDto) => void;
  onEdit?: (document: BookingDocumentItemDto) => void;
  onDelete?: (documentId: string) => void;
}

export default function DocumentCard({
  document,
  onView,
  onEdit,
  onDelete,
}: DocumentCardProps) {
  const isPassport = document.documentType === "Passport";
  const isExpiringSoon =
    document.dateOfExpire &&
    differenceInMonths(parseISO(document.dateOfExpire), new Date()) < 6;
  const isExpired =
    document.dateOfExpire && parseISO(document.dateOfExpire) < new Date();

  return (
    <Card className="overflow-hidden hover:border-green-500 transition-all shadow-sm">
      <CardContent className="px-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
              isPassport
                ? "bg-blue-50 dark:bg-blue-950/30"
                : "bg-green-50 dark:bg-green-950/30"
            )}
          >
            {isPassport ? (
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            ) : (
              <IdCard className="w-6 h-6 text-green-600 dark:text-green-400" />
            )}
          </div>

          {/* Document Info */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header: Type Badge + Actions */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isPassport ? "default" : "secondary"}
                    className="font-medium"
                  >
                    {isPassport ? "Passport" : "CMND/CCCD"}
                  </Badge>
                  {isExpired && (
                    <Badge variant="destructive" className="text-xs">
                      Hết hạn
                    </Badge>
                  )}
                  {isExpiringSoon && !isExpired && (
                    <Badge variant="outline" className="text-xs text-amber-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Sắp hết hạn
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-medium text-foreground truncate">
                    {document.fullName}
                  </span>
                </div>
              </div>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(document)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(document)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(document.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Document Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CreditCard className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">
                  {document.documentNumber || document.idCardNumber || "N/A"}
                </span>
              </div>

              {document.dateOfBirth && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {format(parseISO(document.dateOfBirth), "dd/MM/yyyy")}
                  </span>
                </div>
              )}

              {document.nationality && (
                <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{document.nationality}</span>
                </div>
              )}

              {document.dateOfExpire && (
                <div
                  className={cn(
                    "flex items-center gap-1.5 col-span-2",
                    isExpired
                      ? "text-destructive"
                      : isExpiringSoon
                        ? "text-amber-600"
                        : "text-muted-foreground"
                  )}
                >
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs">
                    Hết hạn:{" "}
                    {format(parseISO(document.dateOfExpire), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Note if exists */}
            {document.note && (
              <div className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2 mt-2">
                {document.note}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
