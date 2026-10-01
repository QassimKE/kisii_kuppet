import { useState, useEffect } from "react";
import MemberLayout from "@/components/member/MemberLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Bus, CalendarDays, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { memberService } from "@/services/member.service";
import { api } from "@/services/api";
import { BookingDetailDialog } from "@/components/shared/BookingDetailDialog";
import type { Booking } from "@/services/types";

type Filter = "all" | "pending" | "approved" | "rejected";

const statusColors: Record<string, string> = {
  approved: "bg-success text-success-foreground",
  pending:  "bg-warning text-warning-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

const VanBooking = () => {
  const { user } = useAuth();
  const [date, setDate]               = useState<Date | undefined>(undefined);
  const [destination, setDest]        = useState("");
  const [purpose, setPurpose]         = useState("");
  const [passengers, setPass]         = useState("1");
  const [passengersList, setPassList] = useState<File | null>(null);
  const [paymentProof, setPayProof]   = useState<File | null>(null);
  const [loading, setLoading]         = useState(false);
  const [bookings, setBookings]       = useState<Booking[]>([]);
  const [filter, setFilter]           = useState<Filter>("all");
  const [bookedDates, setBooked]      = useState<string[]>([]);
  const [detailBooking, setDetail]    = useState<Booking | null>(null);

  const toLocalDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const isBooked    = (d: Date) => bookedDates.includes(toLocalDate(d));
  const isAvailable = (d: Date) => !isBooked(d) && d >= new Date(new Date().toDateString());

  useEffect(() => {
    if (!user) return;
    memberService.getBookings(user.id).then(setBookings);
    memberService.getBookedDates().then(setBooked);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) { toast.error("Please select a date."); return; }
    if (isBooked(date)) { toast.error("This date has already been booked. Please choose another date."); return; }
    if (!user) return;
    setLoading(true);
    try {
      const newBooking = await memberService.submitBooking(
        { date: toLocalDate(date), destination, purpose, passengers: Number(passengers) },
        { passengersList: passengersList ?? undefined, paymentProof: paymentProof ?? undefined },
      );
      setBookings((prev) => [newBooking, ...prev]);
      toast.success(`Booking ${newBooking.id} submitted successfully.`);
      setDate(undefined); setDest(""); setPurpose(""); setPass("1");
      setPassList(null); setPayProof(null);
    } catch {
      toast.error("Failed to submit booking.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter((b) => filter === "all" || b.status === filter);
  const filters: Filter[] = ["all", "pending", "approved", "rejected"];

  return (
    <>
      <MemberLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Van Booking</h1>
            <p className="text-sm text-muted-foreground">Request transport and track your booking status.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bus className="h-5 w-5 text-primary" /> New Booking Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                      disabled={(d) => d < new Date() || isBooked(d)}
                      modifiers={{ booked: isBooked, available: isAvailable }}
                      modifiersClassNames={{
                        booked:    "!bg-destructive/15 !text-destructive line-through cursor-not-allowed",
                        available: "!bg-success/15 !text-success",
                      }}
                    />
                    {date && isBooked(date) && (
                      <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        This date has already been booked. Please choose another date.
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input id="destination" placeholder="e.g. Nairobi" value={destination} onChange={(e) => setDest(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Textarea id="purpose" placeholder="Reason for travel..." rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passengers">Number of Passengers</Label>
                    <Input id="passengers" type="number" min="1" max="14" value={passengers} onChange={(e) => setPass(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passengersList">Attach Passengers List</Label>
                    <Input id="passengersList" type="file" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setPassList(e.target.files?.[0] ?? null)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentProof">Attach Payment Proof</Label>
                    <Input id="paymentProof" type="file" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setPayProof(e.target.files?.[0] ?? null)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Booking
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> My Bookings
              </h2>
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={cn("rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                      filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >{f}</button>
                ))}
              </div>
              <div className="space-y-3">
                {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No bookings found.</p>}
                {filtered.map((b) => (
                  <Card key={b.id} className="shadow-card cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setDetail(b)}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">{b.destination}</p>
                          <p className="text-xs text-muted-foreground">{b.id} · {b.date} · {b.passengers} passenger{b.passengers > 1 ? "s" : ""}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{b.purpose}</p>
                        </div>
                        <Badge className={cn("shrink-0", statusColors[b.status])}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </Badge>
                      </div>
                      {b.remarks && (
                        <div className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-warning" />
                          <span>{b.remarks}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MemberLayout>

      <BookingDetailDialog
        booking={detailBooking}
        onClose={() => setDetail(null)}
        fetchDocument={(filename) => api.download(`/bookings/documents/${filename}`)}
      />
    </>
  );
};

export default VanBooking;
