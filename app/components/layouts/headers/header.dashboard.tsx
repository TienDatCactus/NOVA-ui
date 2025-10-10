import { Plus, SearchIcon } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
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
import CreateBookingDialog from "~/features/create-booking";
import { RESERVATION_NAV_ITEMS } from "~/lib/constants";
import { cn } from "~/lib/utils";

interface DashboardHeaderProps extends React.HTMLAttributes<HTMLElement> {}
export default function DashboardHeader({ ...props }: DashboardHeaderProps) {
  const [open, setOpen] = useState<boolean>(false);
  function close() {
    setOpen(false);
  }
  const curPath = useLocation().pathname;
  return (
    <header className="h-12 shadow-s py-2 px-6 z-10 bg-white flex items-center w-full sticky top-0   justify-between">
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          {RESERVATION_NAV_ITEMS.map((item) => (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuTrigger
                isActive={curPath === item.href}
                hasChildren={!!item?.children}
              >
                <Link to={item.href} className="flex gap-2 items-center">
                  {item.icon}
                  {item.title}
                </Link>
              </NavigationMenuTrigger>
              {item?.children && item?.children.length > 0 && (
                <NavigationMenuContent>
                  <ul className="grid gap-2 w-44">
                    {item.children.map((child) => (
                      <li
                        className={cn({
                          "border-b-2 border-accent-foreground":
                            curPath === child.href,
                        })}
                      >
                        <NavigationMenuLink asChild>
                          <Link to={child.href}>
                            <div className="text-sm leading-none font-medium">
                              {child.title}
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex gap-4 items-center">
        <Button size={"sm"} onClick={() => setOpen(true)}>
          Đặt phòng <Plus />
        </Button>
        <CreateBookingDialog open={open} close={close} />
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
