import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, XCircle, Clock, FileText, Download, Eye, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import type { Claim, Status } from "@/services/types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;

const statusBadge = (s: Status) => {
  const map = {
    approved: "bg-success/10 text-success border-success/20",
    pending:  "bg-warning/10 text-warning border-warning/20",
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

const ClaimsAdmin = () => {
  const [claims, setClaims]         = useState<Claim[]>([]);
  const [filter, setFilter]         = useState<typeof STATUS_FILTERS[number]>("all");
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  const [actionTarget, setActionTarget] = useState<{ claim: Claim; action: "approved" | "rejected" } | null>(null);
  const [remarks, setRemarks]       = useState("");
  const [remarksError, setRemarksError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Claim | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const [detailClaim, setDetailClaim] = useState<Claim | null>(null);

  const load = () => adminService.getAllClaims().then(setClaims).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? claims : claims.filter((c) => c.status === filter);

  const counts = {
    all: claims.length,
    pending:  claims.filter((c) => c.status === "pending").length,
    approved: claims.filter((c) => c.status === "approved").length,
    rejected: claims.filter((c) => c.status === "rejected").length,
  };

  const openAction = (claim: Claim, action: "approved" | "rejected") => {
    setActionTarget({ claim, action });
    setRemarks(""); setRemarksError("");
  };

  const handleAction = async () => {
    if (!actionTarget) return;
    if (actionTarget.action === "rejected" && !remarks.trim()) {
      setRemarksError("Remarks are required when rejecting a claim."); return;
    }
    setSaving(true);
    try {
      await adminService.updateClaimStatus(actionTarget.claim.id, actionTarget.action, remarks.trim() || undefined);
      toast.success(`Claim ${actionTarget.claim.id} ${actionTarget.action} successfully.`);
      setActionTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update claim status.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.deleteClaim(deleteTarget.id);
      toast.success(`Claim ${deleteTarget.id} deleted successfully.`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete claim.");
    } finally { setDeleting(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Claims Management
          </h1>
          <p className="text-sm text-muted-foreground">
            {counts.pending} pending review
          </p>
        </div>

        {/* Filter pills */}
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
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Claims</CardTitle>
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
                      "Phone",
                      "Type",
                      "Claimant",
                      "Amount",
                      "Date",
                      "Docs",
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
                        colSpan={9}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Loading…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No claims found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {c.id}
                        </td>
                        <td className="px-4 py-3 text-foreground whitespace-nowrap">
                          {c.memberName}
                        </td>
                        <td className="px-4 py-3 text-foreground whitespace-nowrap">
                          {c.memberPhone}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {c.type}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {c.claimant}
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium">
                          {c.amount}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {c.createdAt}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {c.documents.map((doc) => (
                              <button
                                key={doc}
                                onClick={() =>
                                  adminService.downloadDocument(doc)
                                }
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <Download className="h-3 w-3" />
                                {doc}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">{statusBadge(c.status)}</td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setDetailClaim(c)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {c.status === "pending" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => openAction(c, "approved")}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openAction(c, "rejected")}
                                  >
                                    <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(c)}
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
      </div>

      {/* Approve / Reject Dialog */}
      <Dialog
        open={!!actionTarget}
        onOpenChange={(o) => !o && setActionTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionTarget?.action} Claim {actionTarget?.claim.id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Member:{" "}
              <span className="text-foreground font-medium">
                {actionTarget?.claim.memberName}
              </span>
              {" · "}Amount:{" "}
              <span className="text-foreground font-medium">
                {actionTarget?.claim.amount}
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

      {/* Claim Detail Drawer */}
      <Sheet
        open={!!detailClaim}
        onOpenChange={(o) => !o && setDetailClaim(null)}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Claim {detailClaim?.id}</SheetTitle>
          </SheetHeader>
          {detailClaim && (
            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Member", detailClaim.memberName],
                  ["Type", detailClaim.type],
                  ["Claimant", detailClaim.claimant],
                  ["TSC No", detailClaim.claimantTsc ?? "—"],
                  ["Relationship", detailClaim.relationship],
                  ["Amount", detailClaim.amount],
                  ["Date", detailClaim.createdAt],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="font-medium text-foreground">{v}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Details</p>
                <p className="text-foreground">{detailClaim.details}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                {statusBadge(detailClaim.status)}
              </div>
              {detailClaim.remarks && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Remarks</p>
                  <p className="text-foreground">{detailClaim.remarks}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Documents ({detailClaim.documents.length})
                </p>
                <div className="space-y-1.5">
                  {detailClaim.documents.map((doc) => (
                    <button
                      key={doc}
                      onClick={() => adminService.downloadDocument(doc)}
                      className="flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      <Download className="h-4 w-4" /> {doc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Claim</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete claim{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.id}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ClaimsAdmin;
