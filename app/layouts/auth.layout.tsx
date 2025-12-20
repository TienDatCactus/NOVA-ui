import { Outlet } from "react-router";
import type { Route } from "./+types/auth.layout";
import authBg from "~/assets/img/1c324d_127c0873be3e4b43bd000d80a46d175a~mv2.avif";
import SectionLayout from "~/components/layouts/sections";
import { TreePalm } from "lucide-react";

export default function Component({}: Route.ComponentProps) {
  return (
    <SectionLayout>
      <div className="grid grid-cols-5 place-items-center h-full w-full ">
        <div
          className="bg-accent w-full h-full col-span-2 relative "
          style={{
            backgroundImage: `url(${authBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute p-6 top-0 text-white flex items-center justify-center space-x-2">
            <div className="p-4 rounded-lg">
              <TreePalm className="size-10" />
            </div>
            <div>
              <h1 className="font-bold text-4xl">NOVA</h1>
              <p className="text-sm text-white">
                Network Operation for Vacation Accommodation
              </p>
            </div>
          </div>
          <div className="absolute flex-col p-6 bottom-0 space-y-4 text-white flex">
            <h2 className="text-3xl font-medium">Welcome to NOVA Platform</h2>
            <p>- NOVA Team -</p>
          </div>
        </div>
        <div className="col-span-3">
          <Outlet />
        </div>
      </div>
    </SectionLayout>
  );
}
