import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Download, FileText, Bus, CheckCircle, Clock, XCircle } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type { Claim, Booking, Status } from "@/services/types";
import { cn } from "@/lib/utils";

const STATUS_OPTS: { value: Status | "all"; label: string }[] = [
  { value: "all",      label: "All" },
  { value: "pending",  label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const statusClass: Record<Status, string> = {
  approved: "bg-success/10 text-success border-success/20",
  pending:  "bg-warning/10 text-warning border-warning/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};
const statusIcon: Record<Status, React.ElementType> = {
  approved: CheckCircle, pending: Clock, rejected: XCircle,
};

const StatusBadge = ({ s }: { s: Status }) => {
  const Icon = statusIcon[s];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", statusClass[s])}>
      <Icon className="h-3 w-3" /><span className="capitalize">{s}</span>
    </span>
  );
};

const amountToNumber = (a: string) => parseInt(a.replace(/\D/g, ""), 10) || 0;

const Reports = () => {
  const [claims, setClaims]     = useState<Claim[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [cFrom, setCFrom] = useState("");
  const [cTo,   setCTo]   = useState("");
  const [cStatus, setCStatus] = useState<Status | "all">("all");

  const [bFrom, setBFrom] = useState("");
  const [bTo,   setBTo]   = useState("");
  const [bStatus, setBStatus] = useState<Status | "all">("all");

  useEffect(() => {
    Promise.all([adminService.getAllClaims(), adminService.getAllBookings()])
      .then(([c, b]) => { setClaims(c); setBookings(b); })
      .finally(() => setLoading(false));
  }, []);

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filteredClaims = claims.filter((c) => {
    if (cStatus !== "all" && c.status !== cStatus) return false;
    if (cFrom && c.createdAt < cFrom) return false;
    if (cTo   && c.createdAt > cTo)   return false;
    return true;
  });

  const filteredBookings = bookings.filter((b) => {
    if (bStatus !== "all" && b.status !== bStatus) return false;
    if (bFrom && b.date < bFrom) return false;
    if (bTo   && b.date > bTo)   return false;
    return true;
  });

  // ── Claim summary stats ────────────────────────────────────────────────────
  const cTotal    = filteredClaims.length;
  const cApproved = filteredClaims.filter((c) => c.status === "approved").length;
  const cPending  = filteredClaims.filter((c) => c.status === "pending").length;
  const cRejected = filteredClaims.filter((c) => c.status === "rejected").length;
  const cAmount   = filteredClaims
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + amountToNumber(c.amount), 0);
  const cRate     = cTotal ? Math.round((cApproved / cTotal) * 100) : 0;

  // ── Booking summary stats ──────────────────────────────────────────────────
  const bTotal    = filteredBookings.length;
  const bApproved = filteredBookings.filter((b) => b.status === "approved").length;
  const bPending  = filteredBookings.filter((b) => b.status === "pending").length;
  const bRejected = filteredBookings.filter((b) => b.status === "rejected").length;
  const bPax      = filteredBookings
    .filter((b) => b.status === "approved")
    .reduce((sum, b) => sum + b.passengers, 0);

  const handleExport = async (type: "claims" | "bookings", format: "csv" | "pdf") => {
    setExporting(true);
    try {
      if (type === "claims")   await adminService.exportClaimsReport(format);
      else                     await adminService.exportBookingsReport(format);
    } finally { setExporting(false); }
  };

  const StatPill = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  );

  const FilterRow = ({
    from, setFrom, to, setTo, status, setStatus,
  }: {
    from: string; setFrom: (v: string) => void;
    to: string;   setTo:   (v: string) => void;
    status: Status | "all"; setStatus: (v: Status | "all") => void;
  }) => (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs">From</Label>
        <Input type="date" className="h-8 text-sm w-36" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">To</Label>
        <Input type="date" className="h-8 text-sm w-36" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Status</Label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status | "all")}
          className="flex h-8 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <Button
        variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground"
        onClick={() => { setFrom(""); setTo(""); setStatus("all"); }}
      >
        Clear
      </Button>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground">Filter, preview and export claims or bookings data</p>
          </div>
        </div>

        <Tabs defaultValue="claims">
          <TabsList>
            <TabsTrigger value="claims" className="gap-2"><FileText className="h-3.5 w-3.5" />Claims</TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2"><Bus className="h-3.5 w-3.5" />Bookings</TabsTrigger>
          </TabsList>

          {/* ── Claims Tab ── */}
          <TabsContent value="claims" className="space-y-4 mt-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground font-medium">Filters</CardTitle>
                <FilterRow
                  from={cFrom} setFrom={setCFrom}
                  to={cTo}     setTo={setCTo}
                  status={cStatus} setStatus={setCStatus}
                />
              </CardHeader>
            </Card>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatPill label="Total Claims"   value={cTotal} />
              <StatPill label="Approved"       value={cApproved} />
              <StatPill label="Pending"        value={cPending} />
              <StatPill label="Rejected"       value={cRejected} />
              <StatPill label="Approval Rate"  value={`${cRate}%`} />
              <StatPill label="Total Approved" value={`KES ${cAmount.toLocaleString()}`} sub="approved claims" />
            </div>

            {/* Export buttons */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={exporting || cTotal === 0} onClick={() => handleExport("claims", "csv")}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
              </Button>
              <Button size="sm" variant="outline" disabled={exporting || cTotal === 0} onClick={() => handleExport("claims", "pdf")}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export PDF
              </Button>
            </div>

            {/* Preview table */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Preview ({filteredClaims.length} records)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        {["ID", "Member", "Type", "Claimant", "Amount", "Date", "Status"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
                      ) : filteredClaims.length === 0 ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No claims match the selected filters.</td></tr>
                      ) : filteredClaims.map((c) => (
                        <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{c.id}</td>
                          <td className="px-4 py-3 text-foreground whitespace-nowrap">{c.memberName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.claimant}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{c.amount}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.createdAt}</td>
                          <td className="px-4 py-3"><StatusBadge s={c.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Bookings Tab ── */}
          <TabsContent value="bookings" className="space-y-4 mt-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground font-medium">Filters</CardTitle>
                <FilterRow
                  from={bFrom} setFrom={setBFrom}
                  to={bTo}     setTo={setBTo}
                  status={bStatus} setStatus={setBStatus}
                />
              </CardHeader>
            </Card>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatPill label="Total Bookings" value={bTotal} />
              <StatPill label="Approved"       value={bApproved} />
              <StatPill label="Pending"        value={bPending} />
              <StatPill label="Rejected"       value={bRejected} />
              <StatPill label="Total Pax"      value={bPax} sub="approved trips" />
            </div>

            {/* Export buttons */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={exporting || bTotal === 0} onClick={() => handleExport("bookings", "csv")}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
              </Button>
              <Button size="sm" variant="outline" disabled={exporting || bTotal === 0} onClick={() => handleExport("bookings", "pdf")}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export PDF
              </Button>
            </div>

            {/* Preview table */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Preview ({filteredBookings.length} records)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        {["ID", "Member", "Date", "Destination", "Purpose", "Pax", "Status"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
                      ) : filteredBookings.length === 0 ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No bookings match the selected filters.</td></tr>
                      ) : filteredBookings.map((b) => (
                        <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{b.id}</td>
                          <td className="px-4 py-3 text-foreground whitespace-nowrap">{b.memberName}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{b.date}</td>
                          <td className="px-4 py-3 text-foreground">{b.destination}</td>
                          <td className="px-4 py-3 text-muted-foreground">{b.purpose}</td>
                          <td className="px-4 py-3 text-muted-foreground">{b.passengers}</td>
                          <td className="px-4 py-3"><StatusBadge s={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Reports;
