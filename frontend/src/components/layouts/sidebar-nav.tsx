import { Link, useLocation } from "react-router-dom";
import { Calendar, UserCheck, BarChart, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/use-auth";
import { useMemo } from "react";

interface SidebarNavProps {
  isCollapsed: boolean;
}

type NavItem = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

export function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const navItems: NavItem[] = useMemo(
    () => [
      { href: "/", icon: Calendar, label: "Dashboard" },
      { href: "/availability", icon: UserCheck, label: "Availability" },
      { href: "/reports", icon: BarChart, label: "Reports" },
      ...(user.role === "admin"
        ? [{ href: "/user-management", icon: Users, label: "User Management" }]
        : []),
    ],
    [user.role]
  );

  const renderLink = (item: NavItem) => {
    const isActive =
      location.pathname === item.href ||
      (item.href !== "/" && location.pathname.startsWith(item.href + "/"));

    return (
      <Button
        asChild
        type="button"
        className={cn(
          "w-full justify-start h-10 transition-all duration-200 mb-1",
          isCollapsed && "w-10 justify-center px-0",
          isActive
            ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-500"
            : "bg-transparent text-slate-400 hover:text-white hover:bg-white/5"
        )}
      >
        <Link to={item.href} aria-current={isActive ? "page" : undefined}>
          <item.icon
            className={cn(
              "h-5 w-5 flex-shrink-0 transition-colors",
              isActive
                ? "text-white"
                : "text-slate-400 group-hover:text-white"
            )}
          />
          <span
            className={cn(
              "truncate ml-3 text-sm font-medium",
              isCollapsed && "hidden"
            )}
          >
            {item.label}
          </span>
        </Link>
      </Button>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="grid gap-1">
        {navItems.map((item) => (
          <div key={item.href}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>{renderLink(item)}</TooltipTrigger>
                <TooltipContent side="right" align="center" className="bg-slate-800 text-white border-slate-700">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              renderLink(item)
            )}
          </div>
        ))}
      </nav>
    </TooltipProvider>
  );
}
