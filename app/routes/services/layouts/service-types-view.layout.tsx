import type { ReactNode } from "react";
import type { ServiceTypeFilters } from "../container/service-types-filter.hooks";
import ServiceTypesCommandBar from "../fragments/service-types/command-bar";

interface ServiceTypesViewLayoutProps {
  children: ReactNode;
  totalTypes: number;
}

export default function ServiceTypesViewLayout({
  children,
  totalTypes,
}: ServiceTypesViewLayoutProps) {
  return (
    <div className="flex flex-col space-y-2 h-full">
      <div className="border-b ">
        <div className=" pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Quản lý các loại dịch vụ
              </h1>
              <p className="text-muted-foreground mt-1">
                Quản lý các loại dịch vụ và sản phẩm của khách sạn
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Tổng số:{" "}
                <span className="font-semibold text-foreground">
                  {totalTypes}
                </span>{" "}
                dịch vụ
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <ServiceTypesCommandBar />
        <main className="flex-1 ">{children}</main>
      </div>
    </div>
  );
}
