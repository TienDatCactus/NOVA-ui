import { Outlet } from "react-router";
import type { Route } from "./+types/auth.layout";
import authBg from "~/assets/img/pexels-monica-tran-2153311664-34075390.jpg";
import SectionLayout from "~/components/layouts/sections";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
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
            <div className="bg-accent p-4 rounded-lg">
              <span className="text-xl">🏞️</span>
            </div>
            <div>
              <h1 className="font-bold text-4xl">NOVA</h1>
              <p className="text-sm text-muted">
                Network Operation for Vacation Acommodation
              </p>
            </div>
          </div>
          <div className="absolute flex-col p-6 bottom-0 space-y-4 text-white flex">
            <h2 className="text-3xl font-medium">
              "Lorem ipsum dolor sit amet ?"
            </h2>
            <p>- Lorem ipser -</p>
          </div>
        </div>
        <div className="col-span-3">
          <Outlet />
        </div>
      </div>
    </SectionLayout>
  );
}
