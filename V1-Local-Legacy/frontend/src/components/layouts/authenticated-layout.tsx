"use client";

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  LogOut,
  Briefcase,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarNav } from "./sidebar-nav";
import { useIsMobile } from "../../hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { cn } from "../../lib/utils";
import { ThemeSwitcher } from "../common/theme-submenu";
import { Separator } from "../ui/separator";

function SidebarContent() {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  return (
    <div
      className={cn(
        "relative h-full flex flex-col bg-card text-card-foreground border-r transition-[width] duration-300",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className={cn("flex items-center p-4", isCollapsed ? "justify-center" : "justify-between")}>
        <Link to="/" className={cn("flex items-center gap-2 font-semibold text-lg", isCollapsed && "hidden")}>
          <Briefcase className="h-6 w-6 text-primary" />
          <span>TrainerSamay</span>
        </Link>
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-transparent hover:bg-muted p-2 rounded-full text-black dark:text-muted-foreground"
          type="button"
        >
          {isCollapsed ? <PanelRight className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex-1 p-2">
        <SidebarNav isCollapsed={isCollapsed} />
      </div>

      <div className="p-2">
        <Separator className="my-2" />
        <ThemeSwitcher isCollapsed={isCollapsed} />
        <Button
          onClick={logout}
          className={cn(
            "w-full justify-start h-11 bg-transparent hover:bg-muted",
            isCollapsed && "w-10 justify-center px-0",
            "text-black dark:text-muted-foreground"
          )}
          type="button"
        >
          <LogOut className="h-5 w-5" />
          <span className={cn("ml-2 truncate", isCollapsed && "hidden")}>Logout</span>
        </Button>
        <Separator className="my-2" />
        <Link to="/profile">
          <div className={cn("flex items-center gap-3 p-2 rounded-lg hover:bg-muted", isCollapsed && "justify-center")}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col", isCollapsed && "hidden")}>
              <span className="text-sm font-medium leading-none">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Briefcase className="h-16 w-16 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <Sheet open={isMobile ? isMobileNavOpen : false} onOpenChange={isMobile ? setIsMobileNavOpen : () => {}}>
      <div className="flex h-screen bg-muted/40">
        {isMobile ? (
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <SheetHeader className="p-4">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        ) : (
          <SidebarContent />
        )}
        <main className="flex flex-1 flex-col">
          {isMobile && (
            <header className="flex h-16 items-center border-b bg-background px-4 sticky top-0 z-30">
              <SheetTrigger>
                <Button className="bg-transparent hover:bg-muted p-2 rounded-full" type="button">
                  <PanelLeft className="h-6 w-6" />
                  <span className="sr-only">Toggle Navigation</span>
                </Button>
              </SheetTrigger>
            </header>
          )}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-1 flex-col"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </Sheet>
  );
}
