import { useLocation } from "react-router";
import { useSidebar } from "~/context/SidebarContext";
import { useAuthStore } from "~/store/auth.store";
import CompactSidebar from "./components/compact.sidebar";
import ExpandedSidebar from "./components/expanded.sidebar";

export default function DashboardSidebar() {
  const curPath = useLocation().pathname;
  const { mode, toggle } = useSidebar();
  const { user } = useAuthStore();
  return (
    <>
      {mode === "expanded" ? (
        <ExpandedSidebar toggle={toggle} curPath={curPath} />
      ) : (
        <CompactSidebar />
      )}
    </>
  );
}
