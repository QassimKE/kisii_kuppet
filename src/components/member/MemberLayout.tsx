import { useState, useEffect, useRef, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Bus,
  FileText,
  CalendarDays,
  Bell,
  User,
  LogOut,
  Menu,
  ChevronUp,
  UserCircle,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { memberService } from "@/services/member.service";
import AdminLayout from "@/components/admin/AdminLayout";

const navItems = [
  { to: "/member-dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/van-booking", icon: Bus, label: "Van Booking" },
  { to: "/claims", icon: FileText, label: "Claims" },
  { to: "/member/events", icon: CalendarDays, label: "Events" },
  { to: "/shared-docs", icon: FolderOpen, label: "Download" },
];

const MemberLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();

  // Admins reuse member pages but keep the admin chrome
  if (user?.role === "admin") return <AdminLayout>{children}</AdminLayout>;
  const location  = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [popupOpen,   setPopupOpen]   = useState(false);
  const [unread,      setUnread]      = useState(0);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    memberService.getNotifications(user.id).then((ns) => setUnread(ns.filter((n) => !n.read).length));
  }, [user]);

  // Close popup on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node))
        setPopupOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const navLink = (to: string, icon: React.ElementType, label: string, badge?: number) => {
    const Icon = icon;
    const active = location.pathname === to;
    return (
      <Link
        key={to} to={to}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
        {badge != null && badge > 0 && (
          <Badge className="ml-auto h-5 min-w-5 justify-center bg-sidebar-primary text-sidebar-primary-foreground text-xs">
            {badge}
          </Badge>
        )}
      </Link>
    );
  };

  const UserFooter = () => (
    <div className="shrink-0 border-t border-sidebar-border p-3 relative" ref={popupRef}>
      {/* Popup */}
      {popupOpen && (
        <div className="absolute bottom-full left-3 right-3 mb-2 rounded-lg border border-sidebar-border bg-sidebar shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-sidebar-border">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">{user?.memberNo}</p>
          </div>
          <div className="p-1.5 space-y-0.5">
            <Link
              to="/profile"
              onClick={() => setPopupOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
            >
              <User className="h-4 w-4" /> My Profile
            </Link>
            <Link
              to="/notifications"
              onClick={() => setPopupOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
            >
              <Bell className="h-4 w-4" />
              Notifications
              {unread > 0 && (
                <Badge className="ml-auto h-5 min-w-5 justify-center bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {unread}
                </Badge>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Log Out
            </button>
          </div>
        </div>
      )}

      {/* Trigger */}
      <button
        onClick={() => setPopupOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-sidebar-accent/50 transition-colors"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/20">
          <UserCircle className="h-5 w-5 text-sidebar-foreground" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-sidebar-foreground truncate">{user?.name}</p>
          <p className="text-[10px] text-sidebar-foreground/60 truncate">{user?.memberNo}</p>
        </div>
        <ChevronUp className={cn("h-3.5 w-3.5 text-sidebar-foreground/50 transition-transform", popupOpen ? "rotate-0" : "rotate-180")} />
      </button>
    </div>
  );

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="font-heading text-sm font-bold text-sidebar-foreground">Kisii KUPPET</span>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 p-3">
        {navItems.map(({ to, icon, label }) => navLink(to, icon, label))}
        {navLink("/notifications", Bell, "Notifications", unread)}
      </nav>

      <UserFooter />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 bg-sidebar md:flex flex-col sticky top-0 h-screen">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-60 bg-sidebar flex flex-col">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold text-foreground hidden sm:block">
              Welcome back, <span className="text-primary">{user?.name?.split(" ")[0]}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/notifications">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile"><User className="h-5 w-5" /></Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default MemberLayout;
