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
import { Separator } from "../ui/separator";

function SidebarContent() {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  return (
    <div
      className={cn(
        "relative h-full flex flex-col bg-slate-900 text-slate-300 transition-[width] duration-300 shadow-xl z-20",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className={cn("flex items-center p-4 h-16 box-border", isCollapsed ? "justify-center" : "justify-between")}>
        <Link to="/" className={cn("flex items-center gap-3 font-bold text-lg text-white tracking-tight", isCollapsed && "hidden")}>
          <div className="bg-indigo-500/20 p-2 rounded-lg">
             <Briefcase className="h-5 w-5 text-indigo-400" />
          </div>
          <span>TrainerSamay</span>
        </Link>
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-transparent hover:bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          type="button"
        >
          {isCollapsed ? <PanelRight className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
        </Button>
      </div>

      <Separator className="bg-slate-800 my-0" />

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <SidebarNav isCollapsed={isCollapsed} />
      </div>

      <Separator className="bg-slate-800 my-0" />

      {/* User Profile / Footer */}
      <div className="p-4 bg-slate-900">
        <Button
          onClick={logout}
          className={cn(
            "w-full justify-start h-10 bg-slate-800/50 hover:bg-red-900/20 hover:text-red-400 text-slate-300 mb-4 transition-all border border-slate-800",
            isCollapsed && "w-10 justify-center px-0",
          )}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          <span className={cn("ml-2 truncate text-sm", isCollapsed && "hidden")}>Sign out</span>
        </Button>

        <Link to="/profile">
          <div className={cn("flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700", isCollapsed && "justify-center")}>
            <Avatar className="h-9 w-9 border-2 border-slate-700 ring-2 ring-slate-900">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-indigo-600 text-white font-medium">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col min-w-0", isCollapsed && "hidden")}>
              <span className="text-sm font-semibold text-white truncate">{user.name}</span>
              <span className="text-xs text-slate-500 truncate">{user.email}</span>
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Briefcase className="h-12 w-12 text-indigo-600 animate-pulse" />
          <p className="text-slate-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <Sheet open={isMobile ? isMobileNavOpen : false} onOpenChange={isMobile ? setIsMobileNavOpen : () => {}}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {isMobile ? (
          <SheetContent side="left" className="p-0 w-72 border-r-0 bg-slate-900 text-slate-300">
            <SheetHeader className="p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        ) : (
          <SidebarContent />
        )}
        <main className="flex flex-1 flex-col overflow-hidden relative">
          {/* Mobile Header */}
          {isMobile && (
            <header className="flex h-16 items-center border-b bg-white px-4 sticky top-0 z-30 shadow-sm">
              <SheetTrigger>
                <Button className="bg-transparent hover:bg-gray-100 p-2 rounded-full text-slate-600" type="button">
                  <PanelLeft className="h-6 w-6" />
                  <span className="sr-only">Toggle Navigation</span>
                </Button>
              </SheetTrigger>
              <div className="ml-4 font-semibold text-slate-800">TrainerSamay</div>
            </header>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-1 flex-col min-h-full"
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
