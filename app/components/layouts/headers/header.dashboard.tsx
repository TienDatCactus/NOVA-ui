import { BookMarked, SearchIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import { useHeaderNav } from "../side-bar/dashboard/container/useHeader";
import { QuickRoomAvailabilityDialog } from "~/features/check-available-rooms";

interface DashboardHeaderProps extends React.HTMLAttributes<HTMLElement> {}
export default function DashboardHeader({ ...props }: DashboardHeaderProps) {
  const { navItems, currentPath } = useHeaderNav();
  const [checkAvailableDialogOpen, setCheckAvailableDialogOpen] =
    useState(false);
  const isMobile = useIsMobile();
  return (
    <header className="h-12 shadow-sm py-6 px-4 z-10 bg-white flex items-center w-full sticky top-0   justify-between border-b">
      <NavigationMenu viewport={isMobile}>
        <NavigationMenuList>
          {navItems.map((item) => (
            <NavigationMenuItem key={item.title}>
              {!!item.children ? (
                <>
                  <NavigationMenuTrigger className="flex gap-2 items-center">
                    {item.icon}
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 w-44">
                      {item.children.map((child) => (
                        <li
                          key={child.title}
                          className={cn({
                            " bg-accent border-b-2 border-primary":
                              currentPath === child.href,
                          })}
                        >
                          <NavigationMenuLink href={child.href}>
                            <div className="text-sm leading-none font-medium">
                              {child.title}
                            </div>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink
                  href={item.href}
                  className={cn({
                    " bg-accent border-b-2 border-primary":
                      currentPath === item.href,
                  })}
                >
                  <div className="flex gap-2 items-center font-medium ">
                    {item.icon}
                    {item.title}
                  </div>
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex gap-4 items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/dashboard/reservation/new-booking">
              <Button variant={"gradient"} className="w-46 h-8">
                <BookMarked size={16} />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Tạo đặt phòng mới</TooltipContent>
        </Tooltip>

        <Button
          variant={"success"}
          onClick={() => setCheckAvailableDialogOpen(true)}
        >
          <BookMarked size={16} />
        </Button>

        <QuickRoomAvailabilityDialog
          onOpenChange={(open) => setCheckAvailableDialogOpen(open)}
          open={checkAvailableDialogOpen}
        />
        <Input
          placeholder="Tìm kiếm..."
          className="w-64 h-8 placeholder:text-sm"
          startAddon={<SearchIcon />}
          endAddon={
            <Kbd>
              <pre>Ctrl + K</pre>
            </Kbd>
          }
        />
      </div>
    </header>
  );
}
