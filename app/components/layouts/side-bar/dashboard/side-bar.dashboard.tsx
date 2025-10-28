import { useLocation } from "react-router";
import { useAuthStore } from "~/store/auth.store";
import CompactSidebar from "./components/compact.sidebar";
import ExpandedSidebar from "./components/expanded.sidebar";
import { useSidebarContext } from "~/context/sidebar.context";

export default function DashboardSidebar() {
  const curPath = useLocation().pathname;
  const { mode, toggle } = useSidebarContext();
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
