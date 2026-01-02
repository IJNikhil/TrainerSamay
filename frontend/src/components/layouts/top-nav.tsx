"use client";

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileBarChart,
  UserCircle,
  LogOut,
  Menu,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

export function TopNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      roles: ["admin", "trainer"],
    },
    {
      title: "Availability",
      href: "/availability",
      icon: CalendarDays,
      roles: ["trainer", "admin"],
    },
    {
      title: "Users",
      href: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "Reports",
      href: "/reports",
      icon: FileBarChart,
      roles: ["admin"],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-1.5 rounded-lg shadow-sm group-hover:shadow-indigo-500/20 transition-all duration-300">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
            TrainerSamay
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SIDE: PROFILE */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 flex items-center gap-2 pl-2 pr-1 hover:bg-slate-100 rounded-full border border-transparent hover:border-slate-200 transition-all"
              >
                <Avatar className="h-7 w-7 border border-slate-200">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium text-slate-700">
                  {user?.name}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-900">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-slate-500">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer flex items-center">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* MOBILE MENU TRIGGER */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-slate-600">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 border-l-slate-200">
              <div className="flex flex-col h-full bg-slate-50/50">
                <div className="p-6 border-b border-slate-100 bg-white">
                   <div className="flex items-center gap-3 mb-1">
                        <div className="bg-indigo-600 text-white p-2 rounded-lg">
                           <Briefcase className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">TrainerSamay</h2>
                   </div>
                   <p className="text-xs text-slate-500 pl-[3.25rem]">Mobile Navigation</p>
                </div>
                
                <div className="flex-1 overflow-auto py-6 px-4 space-y-2">
                  {filteredNavItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-4 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200",
                            isActive
                              ? "bg-white text-indigo-700 shadow-sm border border-indigo-100 ring-1 ring-indigo-500/20"
                              : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:border hover:border-slate-200"
                          )}
                        >
                          <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-slate-400")} />
                          {item.title}
                        </Link>
                    )
                  })}
                </div>
                <div className="p-6 border-t border-slate-100 bg-white">
                     <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-100" onClick={() => {
                        logout();
                        setIsOpen(false);
                     }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                     </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
