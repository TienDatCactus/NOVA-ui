import { Button } from "~/components/ui/button";
import type { Route } from "./+types/not-found";
import { useNavigate } from "react-router";

export const clientLoader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8 relative h-full w-full bg-[#f8fafc]">
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:60px_60px] "></div>
      <div className="text-center z-20">
        <p className="text-base font-semibold text-primary">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-accent-foreground sm:text-7xl">
          Không tìm thấy trang
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
          Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </div>
    </main>
  );
}
