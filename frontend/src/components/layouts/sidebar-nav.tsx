import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  UserCheck,
  BarChart,
  Users,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/use-auth';
import { useMemo } from 'react';

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

  // Memoize nav items for performance
  const navItems: NavItem[] = useMemo(() => [
    { href: '/', icon: Calendar, label: 'Dashboard' },
    { href: '/availability', icon: UserCheck, label: 'Availability' },
    { href: '/reports', icon: BarChart, label: 'Reports' },
    ...(user.role === 'admin'
      ? [{ href: '/user-management', icon: Users, label: 'User Management' }]
      : []),
  ], [user.role]);

  const renderLink = (item: NavItem) => {
    // Active if exact match or starts with (for nested routes)
    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
    const linkContent = (
      <>
        <item.icon
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-colors",
            isActive
              ? "text-white dark:text-primary-foreground"
              : "text-black dark:text-muted-foreground"
          )}
        />
        <span
          className={cn(
            'truncate transition-colors',
            isCollapsed && 'hidden',
            isActive
              ? "text-white dark:text-primary-foreground"
              : "text-black dark:text-muted-foreground"
          )}
        >
          {item.label}
        </span>
      </>
    );

    return (
      <Button
        asChild
        className={cn(
          "w-full justify-start h-11 bg-transparent hover:bg-muted transition-colors",
          isCollapsed && "w-11 justify-center px-0",
          isActive
            ? "bg-primary text-white dark:text-primary-foreground hover:bg-primary/90"
            : "text-black dark:text-muted-foreground"
        )}
        type="button"
      >
        <Link to={item.href} aria-current={isActive ? "page" : undefined}>
          {linkContent}
        </Link>
      </Button>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="grid gap-2">
        {navItems.map((item) => (
          <div key={item.href}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  {renderLink(item)}
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
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
