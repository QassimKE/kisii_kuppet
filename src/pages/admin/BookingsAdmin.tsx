import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, XCircle, Clock, Bus, Eye, CalendarDays, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import { api } from "@/services/api";
import { BookingDetailDialog } from "@/components/shared/BookingDetailDialog";
import type { Booking, Status } from "@/services/types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;

const statusBadge = (s: Status) => {
  const map = {
    approved: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };
  const icons = { approved: CheckCircle, pending: Clock, rejected: XCircle };
  const Icon = icons[s];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", map[s])}>
      <Icon className="h-3 w-3" /> <span className="capitalize">{s}</span>
    </span>
  );
};

const CalendarView = ({ bookings }: { bookings: Booking[] }) => {
  const approved = bookings.filter((b) => b.status === "approved");
  const byDate: Record<string, Booking[]> = {};
  approved.forEach((b) => {
    byDate[b.date] = [...(byDate[b.date] ?? []), b];
  });
  const dates = Object.keys(byDate).sort();

  if (dates.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">No approved bookings to display.</p>;
  }

  return (
    <div className="space-y-3">
      {dates.map((date) => (
        <div key={date} className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{date}</span>
            <Badge variant="secondary">{byDate[date].length} booking{byDate[date].length > 1 ? "s" : ""}</Badge>
          </div>
          <div className="space-y-2">
            {byDate[date].map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm">
                <div>
                  <span className="font-medium text-foreground">{b.memberName}</span>
                  <span className="text-muted-foreground"> → {b.destination}</span>
                </div>
                <span className="text-muted-foreground">{b.passengers} pax</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const BookingsAdmin = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionTarget, setActionTarget] = useState<{ booking: Booking; action: "approved" | "rejected" } | null>(null);
  const [remarks, setRemarks] = useState("");
  const [remarksError, setRemarksError] = useState("");
  const [detailBooking, setDetail] = useState<Booking | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => adminService.getAllBookings().then(setBookings).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };

  const openAction = (booking: Booking, action: "approved" | "rejected") => {
    setActionTarget({ booking, action });
    setRemarks(""); setRemarksError("");
  };

  const handleAction = async () => {
    if (!actionTarget) return;
    if (actionTarget.action === "rejected" && !remarks.trim()) {
      setRemarksError("Remarks are required when rejecting a booking."); return;
    }
    setSaving(true);
    try {
      await adminService.updateBookingStatus(actionTarget.booking.id, actionTarget.action, remarks.trim() || undefined);
      toast.success(`Booking ${actionTarget.booking.id} ${actionTarget.action} successfully.`);
      setActionTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update booking status.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.deleteBooking(deleteTarget.id);
      toast.success(`Booking ${deleteTarget.id} deleted successfully.`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete booking.");
    } finally { setDeleting(false); }
  };

  return (
    <>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bookings Management
            </h1>
            <p className="text-sm text-muted-foreground">
              {counts.pending} pending review
            </p>
          </div>

          <Tabs defaultValue="table">
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4 mt-4">
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors capitalize",
                      filter === f
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    {f} ({counts[f]})
                  </button>
                ))}
              </div>

              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Van Bookings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          {[
                            "ID",
                            "Member",
                            "Date",
                            "Destination",
                            "Purpose",
                            "Pax",
                            "Status",
                            "Actions",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-4 py-8 text-center text-muted-foreground"
                            >
                              Loading…
                            </td>
                          </tr>
                        ) : filtered.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-4 py-8 text-center text-muted-foreground"
                            >
                              No bookings found.
                            </td>
                          </tr>
                        ) : (
                          filtered.map((b) => (
                            <tr
                              key={b.id}
                              className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                            >
                              <td className="px-4 py-3 font-medium text-foreground">
                                {b.id}
                              </td>
                              <td className="px-4 py-3 text-foreground whitespace-nowrap">
                                {b.memberName}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                {b.date}
                              </td>
                              <td className="px-4 py-3 text-foreground">
                                {b.destination}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {b.purpose}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {b.passengers}
                              </td>
                              <td className="px-4 py-3">
                                {statusBadge(b.status)}
                              </td>
                              <td className="px-4 py-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setDetail(b)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    {b.status === "pending" && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => openAction(b, "approved")}>
                                          <CheckCircle className="mr-2 h-4 w-4 text-success" />
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openAction(b, "rejected")}>
                                          <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                          Reject
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setDeleteTarget(b)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="mt-4">
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">
                      Approved Bookings Calendar
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="py-8 text-center text-muted-foreground">
                      Loading…
                    </p>
                  ) : (
                    <CalendarView bookings={bookings} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>

      {/* Approve / Reject Dialog */}
      <Dialog
        open={!!actionTarget}
        onOpenChange={(o) => !o && setActionTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionTarget?.action} Booking {actionTarget?.booking.id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Member:{" "}
              <span className="text-foreground font-medium">
                {actionTarget?.booking.memberName}
              </span>
              {" · "}Date:{" "}
              <span className="text-foreground font-medium">
                {actionTarget?.booking.date}
              </span>
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="remarks">
                Remarks{" "}
                {actionTarget?.action === "rejected" && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Textarea
                id="remarks"
                placeholder={
                  actionTarget?.action === "rejected"
                    ? "Reason for rejection (required)"
                    : "Optional remarks…"
                }
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  setRemarksError("");
                }}
                rows={3}
              />
              {remarksError && (
                <p className="text-xs text-destructive">{remarksError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={saving}
              variant={
                actionTarget?.action === "rejected" ? "destructive" : "default"
              }
            >
              {saving ? "Processing…" : `Confirm ${actionTarget?.action}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Detail Dialog */}
      <BookingDetailDialog
        booking={detailBooking}
        onClose={() => setDetail(null)}
        fetchDocument={(filename) =>
          api.download(`/admin/bookings/documents/${filename}`)
        }
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete booking <span className="font-medium text-foreground">{deleteTarget?.id}</span>?
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingsAdmin;
