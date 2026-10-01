import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CalendarDays, Plus, Pencil, Trash2, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/context/ConfirmContext";
import { adminService } from "@/services/admin.service";
import type { Event } from "@/services/types";

const EMPTY_FORM = {
  title: "", date: "", time: "", location: "", description: "",
  status: "upcoming" as Event["status"],
};

type FormState = typeof EMPTY_FORM;

const EventsAdmin = () => {
  const [events, setEvents]   = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const confirm = useConfirm();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Event | null>(null);
  const [form, setForm]   = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");

  const load = () => adminService.getEvents().then(setEvents).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const setF = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.title || !form.date || !form.time || !form.location || !form.description) {
      setError("All fields are required."); return false;
    }
    setError(""); return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await adminService.createEvent(form);
      toast.success("Event created successfully.");
      setCreateOpen(false); setForm(EMPTY_FORM); load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create event.");
    } finally { setSaving(false); }
  };

  const openEdit = (ev: Event) => {
    setEditTarget(ev);
    setForm({ title: ev.title, date: ev.date, time: ev.time, location: ev.location, description: ev.description, status: ev.status });
    setError("");
  };

  const handleEdit = async () => {
    if (!editTarget || !validate()) return;
    setSaving(true);
    try {
      await adminService.updateEvent(editTarget.id, form);
      toast.success("Event updated successfully.");
      setEditTarget(null); load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update event.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (ev: Event) => {
    try {
      await confirm({
        title: `Delete "${ev.title}"?`,
        description: "This action cannot be undone. All members will lose visibility of this event.",
        confirmLabel: "Delete Event",
        variant: "destructive",
      });
    } catch { return; }
    setSaving(true);
    try {
      await adminService.deleteEvent(ev.id);
      toast.success("Event deleted.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete event.");
    } finally { setSaving(false); }
  };

  const upcoming = events.filter((e) => e.status === "upcoming");
  const past     = events.filter((e) => e.status === "past");

  // Inline form JSX — NOT a sub-component, to avoid React unmounting inputs on every keystroke
  const formFields = (
    <div className="space-y-3 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="title">Event Title</Label>
        <Input id="title" value={form.title} onChange={setF("title")} placeholder="e.g. Annual General Meeting" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={form.date} onChange={setF("date")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="time">Time</Label>
          <Input id="time" type="time" value={form.time} onChange={setF("time")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={form.location} onChange={setF("location")} placeholder="e.g. Kisii KUPPET Offices" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} value={form.description} onChange={setF("description")} placeholder="Brief description of the event…" />
      </div>
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Event["status"] }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );

  const EventCard = ({ ev }: { ev: Event }) => (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-foreground truncate">{ev.title}</h3>
          <Badge variant={ev.status === "upcoming" ? "default" : "secondary"} className="shrink-0">
            {ev.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{ev.date}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.time}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{ev.description}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ev)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(ev)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Events Management</h1>
            <p className="text-sm text-muted-foreground">{upcoming.length} upcoming · {past.length} past</p>
          </div>
          <Button onClick={() => { setForm(EMPTY_FORM); setError(""); setCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Create Event
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading…</p>
        ) : (
          <>
            {upcoming.length > 0 && (
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Upcoming Events ({upcoming.length})</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcoming.map((ev) => <EventCard key={ev.id} ev={ev} />)}
                </CardContent>
              </Card>
            )}

            {past.length > 0 && (
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-muted-foreground">Past Events ({past.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 opacity-70">
                  {past.map((ev) => <EventCard key={ev.id} ev={ev} />)}
                </CardContent>
              </Card>
            )}

            {events.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No events yet. Create one to get started.</p>
            )}
          </>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) { setCreateOpen(false); setError(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setError(""); }}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Creating…" : "Create Event"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) { setEditTarget(null); setError(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditTarget(null); setError(""); }}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default EventsAdmin;
