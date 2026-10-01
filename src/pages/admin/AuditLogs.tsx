import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type { AuditLog } from "@/services/types";
import { cn } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  CLAIM_APPROVED:   "bg-success/10 text-success border-success/20",
  CLAIM_REJECTED:   "bg-destructive/10 text-destructive border-destructive/20",
  BOOKING_APPROVED: "bg-success/10 text-success border-success/20",
  BOOKING_REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
  MEMBER_ADDED:     "bg-primary/10 text-primary border-primary/20",
  MEMBER_UPDATED:   "bg-primary/10 text-primary border-primary/20",
  MEMBER_DISABLED:  "bg-warning/10 text-warning border-warning/20",
  MEMBER_ENABLED:   "bg-success/10 text-success border-success/20",
  EVENT_CREATED:    "bg-primary/10 text-primary border-primary/20",
  EVENT_UPDATED:    "bg-primary/10 text-primary border-primary/20",
  EVENT_DELETED:    "bg-destructive/10 text-destructive border-destructive/20",
  REPORT_EXPORTED:  "bg-muted text-muted-foreground border-border",
  LOGIN:            "bg-muted text-muted-foreground border-border",
  LOGOUT:           "bg-muted text-muted-foreground border-border",
};

const ACTION_TYPES = [
  "all", "LOGIN", "LOGOUT", "MEMBER_ADDED", "MEMBER_UPDATED", "MEMBER_DISABLED",
  "MEMBER_ENABLED", "MEMBER_REGISTERED", "BULK_IMPORT", "PROFILE_UPDATED",
  "BENEFICIARIES_UPDATED", "PASSWORD_RESET", "BOOKING_SUBMITTED", "BOOKING_APPROVED",
  "BOOKING_REJECTED", "CLAIM_SUBMITTED", "CLAIM_APPROVED", "CLAIM_REJECTED",
  "EVENT_CREATED", "EVENT_UPDATED", "EVENT_DELETED", "REPORT_EXPORTED",
];

const PAGE_SIZES = [25, 50, 100];

const ActionBadge = ({ action }: { action: string }) => (
  <span className={cn(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
    ACTION_COLORS[action] ?? "bg-muted text-muted-foreground border-border"
  )}>
    {action.replace(/_/g, " ")}
  </span>
);

const AuditLogs = () => {
  const [logs,     setLogs]     = useState<AuditLog[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading,  setLoading]  = useState(true);

  // Filter inputs (typed but not yet committed)
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [from,   setFrom]   = useState("");
  const [to,     setTo]     = useState("");

  // Committed values — sent to API
  const [committed, setCommitted] = useState({ search: "", action: "all", from: "", to: "" });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const load = useCallback((p = page, ps = pageSize, f = committed) => {
    setLoading(true);
    adminService.getAuditLogs({
      page: p, pageSize: ps,
      search: f.search   || undefined,
      action: f.action !== "all" ? f.action : undefined,
      from:   f.from     || undefined,
      to:     f.to       || undefined,
    })
      .then((res) => { setLogs(res.data); setTotal(res.total); })
      .finally(() => setLoading(false));
  }, [page, pageSize, committed]);

  useEffect(() => { load(); }, [load]);

  const applyFilters = () => {
    const next = { search, action, from, to };
    setCommitted(next);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(""); setAction("all"); setFrom(""); setTo("");
    setCommitted({ search: "", action: "all", from: "", to: "" });
    setPage(1);
  };

  const handlePageSize = (val: string) => { setPageSize(Number(val)); setPage(1); };
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const isFiltered = committed.search || committed.action !== "all" || committed.from || committed.to;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-sm text-muted-foreground">{total.toLocaleString()} total entries</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5 flex-1 min-w-48">
                <Label className="text-xs">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8 h-8 text-sm"
                    placeholder="Action, user, target, details…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Action Type</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger className="h-8 text-sm w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map((a) => (
                      <SelectItem key={a} value={a}>{a === "all" ? "All Actions" : a.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">From</Label>
                <Input type="date" className="h-8 text-sm w-36" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To</Label>
                <Input type="date" className="h-8 text-sm w-36" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>

              <Button size="sm" className="h-8" onClick={applyFilters} disabled={loading}>
                <Search className="h-3.5 w-3.5 mr-1.5" /> Search
              </Button>
              {isFiltered && (
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Log Entries
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({total === 0 ? "0" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total.toLocaleString()}`})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {["Timestamp", "Action", "Performed By", "Target", "Details"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No log entries match the selected filters.</td></tr>
                  ) : logs.map((l) => (
                    <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap font-mono text-xs">{l.timestamp}</td>
                      <td className="px-4 py-3"><ActionBadge action={l.action} /></td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{l.performedBy}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{l.target}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate" title={l.details}>{l.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page:</span>
                <Select value={String(pageSize)} onValueChange={handlePageSize}>
                  <SelectTrigger className="h-8 w-16 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{PAGE_SIZES.map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goTo(1)} disabled={page === 1 || loading}>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goTo(page - 1)} disabled={page === 1 || loading}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm text-foreground">
                  Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
                </span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goTo(page + 1)} disabled={page === totalPages || loading}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goTo(totalPages)} disabled={page === totalPages || loading}>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AuditLogs;
