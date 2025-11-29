import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Info, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { ConfigSchema } from "~/services/api/configs/configs.schem";
import type { ConfigGroupItem } from "~/services/api/configs/dto";
import {
  useConfigDetail,
  useTimezones,
  useUpdateConfig,
} from "../container/query.hooks";

type EditConfigForm = z.infer<typeof ConfigSchema.UpdateConfigRequestSchema>;

interface EditConfigDialogProps {
  config: ConfigGroupItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditConfigDialog({
  config,
  open,
  onOpenChange,
}: EditConfigDialogProps) {
  const { mutate: updateConfig, isPending } = useUpdateConfig();
  const { data: timezones } = useTimezones();
  const { data: configDetail } = useConfigDetail(config.key);
  // 1. Intelligent Type Detection
  const isTimezoneField =
    config.dataType?.toLowerCase() === "timezone" ||
    config.key.toLowerCase().includes("timezone");

  // Check if it's a boolean config based on dataType OR current value content
  const isBoolean =
    config.dataType?.toLowerCase() === "boolean" ||
    config.currentValue === "true" ||
    config.currentValue === "false";

  // Check if it's a long text (e.g., JSON config or HTML template)
  const isLongText =
    (config.currentValue && config.currentValue.length > 60) ||
    config.dataType === "json" ||
    config.dataType === "textarea";

  const form = useForm<EditConfigForm>({
    resolver: zodResolver(ConfigSchema.UpdateConfigRequestSchema),
    defaultValues: {
      value: isBoolean
        ? String(config.currentValue === "true")
        : config.currentValue,
      description: config.description || "",
    },
  });

  useEffect(() => {
    form.reset({
      value: isBoolean
        ? String(configDetail?.currentValue === "true")
        : configDetail?.currentValue,
      description: configDetail?.description || "",
    });
  }, [configDetail?.currentValue, config.description, isBoolean]);
  const onSubmit = (data: EditConfigForm) => {
    updateConfig(
      {
        key: config.key,
        data: {
          value: String(data.value), // Ensure we send string back to API
          description: data.description,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader className="space-y-4 pb-4 border-b border-border">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl">Chỉnh sửa cấu hình</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className="font-mono text-xs px-2 py-0.5 bg-muted text-foreground/80 hover:bg-muted select-all"
              >
                {config.key}
              </Badge>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5 text-muted-foreground/50 hover:text-foreground"
                onClick={() => navigator.clipboard.writeText(config.key)}
                title="Copy Key"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-md bg-blue-50/50 dark:bg-blue-950/20 p-3 text-sm text-blue-900 dark:text-blue-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="leading-relaxed opacity-90">
              {config.description ||
                "No description provided for this configuration."}
            </p>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-2"
          >
            {/* === SMART VALUE INPUT === */}
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base font-semibold">
                      Giá trị cấu hình
                    </FormLabel>

                    {/* Quick Action: Reset to Default (Visual hint only for now) */}
                    {config.defaultValue && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                        onClick={() =>
                          form.setValue(
                            "value",
                            isBoolean
                              ? String(config.defaultValue === "true")
                              : config.defaultValue!
                          )
                        }
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Sử dụng mặc định
                      </Button>
                    )}
                  </div>

                  <FormControl>
                    {/* CASE 1: TIMEZONE SELECT */}
                    {isTimezoneField && timezones ? (
                      <Select
                        value={String(field.value)}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {timezones.timeZones.map((tz) => (
                            <SelectItem key={tz.id} value={tz.id}>
                              <span className="font-medium">
                                {tz.displayName}
                              </span>
                              <span className="ml-2 text-muted-foreground text-xs">
                                (UTC{tz.baseUtcOffsetHours >= 0 ? "+" : ""}
                                {tz.baseUtcOffsetHours})
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : /* CASE 2: BOOLEAN SWITCH */
                    isBoolean ? (
                      <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-card">
                        <div className="space-y-0.5">
                          <Label className="text-base">
                            Trạng thái kích hoạt
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Chuyển đổi để bật hoặc tắt tính năng này.
                          </p>
                        </div>
                        <Switch
                          checked={field.value === "true"}
                          onCheckedChange={(e) =>
                            field.onChange(e ? "true" : "false")
                          }
                        />
                      </div>
                    ) : isLongText ? (
                      <Textarea
                        {...field}
                        value={String(field.value)}
                        className="font-mono text-sm min-h-[120px] leading-relaxed resize-y"
                        placeholder="Enter configuration value..."
                      />
                    ) : (
                      /* CASE 4: STANDARD INPUT */
                      <Input
                        {...field}
                        value={String(field.value)}
                        className="h-11 font-mono text-sm"
                        placeholder="Enter value..."
                      />
                    )}
                  </FormControl>

                  {/* Reference: Default Value Box */}
                  <div className="mt-2 rounded-md bg-muted/40 p-3 text-xs border border-border/50">
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                      Mặc định hệ thống:
                    </span>
                    <div className="font-mono mt-1 text-foreground/80 break-all">
                      {config.defaultValue || (
                        <span className="italic opacity-50">null</span>
                      )}
                    </div>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* === DESCRIPTION INPUT === */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú quản trị</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Tại sao bạn thay đổi điều này? (Tùy chọn)"
                      className="resize-none min-h-[80px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Ghi chú này sẽ hiển thị với các quản trị viên khác.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
