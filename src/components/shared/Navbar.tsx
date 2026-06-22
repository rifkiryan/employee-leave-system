"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, CalendarDays, LogOut, Menu, UserPlus, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { AuthStorageService } from "@/services/auth-storage";
import { useState, useEffect } from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/leave", label: "Leave Requests", icon: CalendarDays },
  { href: "/code-review", label: "Code Review", icon: ClipboardCheck },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = AuthStorageService.getSession();
    if (session?.role === "ADMIN" || session?.username === "admin") {
      setIsAdmin(true);
    }
  }, []);

  const handleLogout = () => {
    AuthStorageService.logout();
    router.push("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#070b19]/90 backdrop-blur-md border-b border-cyan-500/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.4)] border border-cyan-300/30">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <span className="text-md font-bold text-white tracking-widest font-mono uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
              Leave Portal
            </span>
          </Link>

          {/* Desktop Nav */}
          <NavLinks pathname={pathname} isAdmin={isAdmin} />

          {/* Desktop Logout */}
          <Button
            variant="ghost"
            onClick={() => setShowLogoutDialog(true)}
            className="hidden md:flex items-center gap-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 font-mono text-xs uppercase"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-slate-950 border-r border-cyan-500/10 p-0 text-white">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.4)] border border-cyan-300/30">
                    <CalendarDays className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-md font-bold text-white tracking-widest font-mono uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
                    Leave Portal
                  </span>
                </div>
                <Separator className="bg-slate-800 mb-4" />
                <NavLinks mobile pathname={pathname} isAdmin={isAdmin} onClose={() => setOpen(false)} />
                <Separator className="bg-slate-800 my-4" />
                <Button
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    setShowLogoutDialog(true);
                  }}
                  className="w-full justify-start gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-mono text-xs uppercase"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="SYSTEM LOGOUT"
        description="You are about to sever the connection to the mainframe. Do you wish to proceed?"
        onConfirm={() => {
          setShowLogoutDialog(false);
          handleLogout();
        }}
        variant="logout"
      />
    </>
  );
}

const NavLinks = ({
  pathname,
  onClose,
  mobile = false,
  isAdmin = false,
}: {
  pathname: string;
  onClose?: () => void;
  mobile?: boolean;
  isAdmin?: boolean;
}) => {
  const items = [...navItems];

  return (
  <nav className={mobile ? "flex flex-col gap-2" : "hidden md:flex items-center gap-2"}>
    {items.map((item) => {
      const isActive = pathname.startsWith(item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => mobile && onClose?.()}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-all duration-200 border
            ${
              isActive
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                : "text-slate-400 border-transparent hover:text-white hover:bg-slate-900/50"
            }`}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      );
    })}
  </nav>
  );
};

