import { Plus, SearchIcon } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
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
import { cn } from "~/lib/utils";
import { useHeaderNav } from "../side-bar/dashboard/container/useHeader";

interface DashboardHeaderProps extends React.HTMLAttributes<HTMLElement> {}
export default function DashboardHeader({ ...props }: DashboardHeaderProps) {
  const [open, setOpen] = useState<boolean>(false);
  const { navItems, currentPath } = useHeaderNav();
  function close() {
    setOpen(false);
  }
  console.log(navItems);
  return (
    <header className="h-12 shadow-sm py-6 px-6 z-10 bg-background flex items-center w-full sticky top-0   justify-between border-b">
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          {navItems.map((item) => (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuTrigger
                isActive={currentPath === item.href}
                hasChildren={!!item?.children}
              >
                {item.href ? (
                  <Link to={item.href!} className="flex gap-2 items-center">
                    {item.icon}
                    {item.title}
                  </Link>
                ) : (
                  <div className="flex gap-2 items-center">
                    {item.icon}
                    {item.title}
                  </div>
                )}
              </NavigationMenuTrigger>
              {item?.children && item?.children.length > 0 && (
                <NavigationMenuContent>
                  <ul className="grid gap-2 w-44">
                    {item.children.map((child) => (
                      <li
                        key={child.title}
                        className={cn({
                          " bg-accent rounded-sm": currentPath === child.href,
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
