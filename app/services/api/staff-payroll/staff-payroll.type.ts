// Component Type Configuration
export const ComponentTypeConfig = {
  Bonus: { label: "Thưởng KPI", color: "text-green-600" },
  Allowance: { label: "Phụ cấp xăng xe", color: "text-blue-600" },
  Responsibility: { label: "Phụ cấp trách nhiệm", color: "text-purple-600" },
  LeavePayout: { label: "Thanh toán phép", color: "text-cyan-600" },
  AdjustmentIncrease: { label: "Điều chỉnh tăng", color: "text-green-600" },
  Penalty: { label: "Phạt đi muộn", color: "text-red-600" },
  Advance: { label: "Tạm ứng", color: "text-orange-600" },
  AdjustmentDecrease: { label: "Điều chỉnh giảm", color: "text-red-600" },
} as const;

export type ComponentTypeKey = keyof typeof ComponentTypeConfig;
