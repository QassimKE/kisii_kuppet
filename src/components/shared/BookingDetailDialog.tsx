import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Paperclip, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Booking, Status } from "@/services/types";

const statusBadge = (s: Status) => {
  const map   = { approved: "bg-success/10 text-success border-success/20", pending: "bg-warning/10 text-warning border-warning/20", rejected: "bg-destructive/10 text-destructive border-destructive/20" };
  const icons = { approved: CheckCircle, pending: Clock, rejected: XCircle };
  const Icon  = icons[s];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", map[s])}>
      <Icon className="h-3 w-3" /> <span className="capitalize">{s}</span>
    </span>
  );
};

interface Props {
  booking: Booking | null;
  onClose: () => void;
  fetchDocument: (filename: string) => Promise<Blob>;
}

export function BookingDetailDialog({ booking, onClose, fetchDocument }: Props) {
  const openDoc = async (filename: string) => {
    try {
      const blob = await fetchDocument(filename);
      window.open(URL.createObjectURL(blob), "_blank");
    } catch {
      toast.error("Failed to open document.");
    }
  };

  return (
    <Dialog open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Booking {booking?.id}</DialogTitle>
        </DialogHeader>
        {booking && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {([
                ["Member",      booking.memberName],
                ["Date",        booking.date],
                ["Destination", booking.destination],
                ["Passengers",  String(booking.passengers)],
                ["Submitted",   booking.createdAt],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="font-medium text-foreground">{v}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Purpose</p>
                <p className="font-medium text-foreground">{booking.purpose}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              {statusBadge(booking.status)}
            </div>

            {booking.remarks && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Remarks</p>
                <p className="text-foreground">{booking.remarks}</p>
              </div>
            )}

            {(booking.passengersList || booking.paymentProof) && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Attachments</p>
                {booking.passengersList && (
                  <button
                    onClick={() => openDoc(booking.passengersList!)}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-primary hover:bg-muted/50 transition-colors w-full text-left"
                  >
                    <Paperclip className="h-3.5 w-3.5 shrink-0" /> Passengers List
                  </button>
                )}
                {booking.paymentProof && (
                  <button
                    onClick={() => openDoc(booking.paymentProof!)}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-primary hover:bg-muted/50 transition-colors w-full text-left"
                  >
                    <Paperclip className="h-3.5 w-3.5 shrink-0" /> Payment Receipt
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
