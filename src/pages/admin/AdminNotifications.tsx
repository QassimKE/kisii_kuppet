import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, FileText, Bus, CalendarDays, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { memberService } from "@/services/member.service";
import type { Notification } from "@/services/types";
import { toast } from "sonner";

type Filter = "all" | "unread" | "claim" | "booking" | "event";

const typeIcon  = { claim: FileText, booking: Bus, event: CalendarDays };
const typeColor = { claim: "text-info", booking: "text-primary", event: "text-warning" };

const AdminNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!user) return;
    memberService.getNotifications(user.id).then(setNotifications);
  }, [user]);

  const markRead = async (id: string) => {
    await memberService.markNotificationRead(id);
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAll = async () => {
    if (!user) return;
    await memberService.markAllRead(user.id);
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read.");
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "all") return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filters: { key: Filter; label: string }[] = [
    { key: "all",     label: "All" },
    { key: "unread",  label: `Unread (${unreadCount})` },
    { key: "claim",   label: "Claims" },
    { key: "booking", label: "Bookings" },
    { key: "event",   label: "Events" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAll}>
              <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >{label}</button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No notifications</p>
            </div>
          )}
          {filtered.map((n) => {
            const Icon = typeIcon[n.type];
            return (
              <Card key={n.id}
                className={cn("shadow-card cursor-pointer transition-colors hover:bg-muted/30", !n.read && "border-primary/30 bg-primary/5")}
                onClick={() => !n.read && markRead(n.id)}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={cn("mt-0.5 shrink-0", typeColor[n.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !n.read ? "font-semibold text-foreground" : "text-muted-foreground")}>{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.createdAt}</p>
                  </div>
                  {!n.read && <Badge className="shrink-0 bg-primary text-primary-foreground text-xs">New</Badge>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
