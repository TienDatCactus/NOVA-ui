// src/context/SidebarContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

type SidebarMode = "compact" | "expanded";

interface SidebarContextType {
  mode: SidebarMode;
  setMode: (m: SidebarMode) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarToggleProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SidebarMode>("compact");

  const toggle = () =>
    setMode((prev) => (prev === "compact" ? "expanded" : "compact"));

  return (
    <SidebarContext.Provider value={{ mode, setMode, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside SidebarProvider");
  return ctx;
}
