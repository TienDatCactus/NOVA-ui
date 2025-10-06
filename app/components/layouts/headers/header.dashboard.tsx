import { SearchIcon } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Kbd } from "~/components/ui/kbd";

export default function DashboardHeader({ ...props }) {
  return (
    <header className="h-12 shadow-s px-4 z-10 bg-white w-full flex items-center mb-4 fixed">
      <div>
        <Input
          placeholder="Tìm kiếm..."
          className="w-64 h-8 placeholder:text-sm"
          startIcon={<SearchIcon />}
          endIcon={
            <Kbd>
              <pre>Ctrl + K</pre>
            </Kbd>
          }
        />
      </div>
      <div></div>
    </header>
  );
}
