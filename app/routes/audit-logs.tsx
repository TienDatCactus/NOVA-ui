import DashboardLayout from "~/layouts/dashboard.layout";
import AuditLogs from "./audit-logs";

export default function AuditLogsPage() {
  return (
    <DashboardLayout>
      <AuditLogs />
    </DashboardLayout>
  );
}
