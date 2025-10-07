import { Plus, SearchIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Kbd } from "~/components/ui/kbd";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { RESERVATION_NAV_ITEMS } from "~/lib/constants";

interface DashboardHeaderProps extends React.HTMLAttributes<HTMLElement> {}
export default function DashboardHeader({ ...props }: DashboardHeaderProps) {
  return (
    <header className="h-12 shadow-s px-6 z-10 bg-white flex items-center w-full sticky top-0  justify-between">
      <NavigationMenu>
        <NavigationMenuList>
          {RESERVATION_NAV_ITEMS.map((item) => (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuTrigger>
                <span className="flex gap-2 items-center">
                  {item.icon}
                  {item.title}
                </span>
              </NavigationMenuTrigger>
              {item?.children && (
                <NavigationMenuContent>
                  {item.children.map((child) => (
                    <NavigationMenuLink key={child.title} href={child.href}>
                      {child.title}
                    </NavigationMenuLink>
                  ))}
                </NavigationMenuContent>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex gap-4 items-center">
        <Button size={"sm"}>
          Đặt phòng <Plus />
        </Button>

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
    </header>
  );
}
