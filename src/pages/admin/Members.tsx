import { useEffect, useRef, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Search, Plus, Pencil, UserX, UserCheck, Upload, Download, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from "lucide-react";
import { useConfirm } from "@/context/ConfirmContext";
import { adminService } from "@/services/admin.service";
import type { User, SubCounty } from "@/services/types";
import { cn } from "@/lib/utils";

const SUB_COUNTIES: SubCounty[] = [
  "Ithanga-Kakuzi", "Gatanga", "Kandara", "Kisii South",
  "Kigumo", "Kisii East", "Kahuro", "Mathioya", "Kangema",
];

const EMPTY_FORM = {
  name: "", surname: "", gender: "" as "M" | "F" | "",
  email: "", memberNo: "", school: "",
  phone: "", password: "", subCounty: "" as SubCounty | "", zone: "",
  role: "member" as "admin" | "member",
};

const PAGE_SIZES = [25, 50, 100];

const Members = () => {
  const [members,    setMembers]    = useState<User[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(25);
  const [search,     setSearch]     = useState("");
  const [committed,  setCommitted]  = useState(""); // search value sent to API
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [importing,  setImporting]  = useState(false);
  const [importMsg,  setImportMsg]  = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const confirm = useConfirm();
  const [addOpen,     setAddOpen]     = useState(false);
  const [editOpen,    setEditOpen]    = useState(false);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [editTarget,  setEditTarget]  = useState<User | null>(null);
  const [error,       setError]       = useState("");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const load = useCallback((p = page, ps = pageSize, q = committed) => {
    setLoading(true);
    adminService.getMembers({ page: p, pageSize: ps, search: q || undefined })
      .then((res) => { setMembers(res.data); setTotal(res.total); })
      .finally(() => setLoading(false));
  }, [page, pageSize, committed]);

  useEffect(() => { load(); }, [load]);

  // Execute search — reset to page 1
  const handleSearch = () => {
    setCommitted(search);
    setPage(1);
  };

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handlePageSize = (val: string) => {
    setPageSize(Number(val));
    setPage(1);
  };

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  // ── Form helpers ───────────────────────────────────────────────────────────

  const field = (key: keyof typeof EMPTY_FORM, label: string, type = "text", required = true) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}{!required && <span className="text-muted-foreground text-xs ml-1">(optional)</span>}</Label>
      <Input id={key} type={type} value={form[key] as string} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
    </div>
  );

  const roleSelect = (
    <div className="space-y-1.5">
      <Label>Role</Label>
      <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as "admin" | "member" }))}>
        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="member">Member</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const subCountySelect = (
    <div className="space-y-1.5">
      <Label>Sub-County <span className="text-muted-foreground text-xs ml-1">(optional)</span></Label>
      <Select value={form.subCounty} onValueChange={(v) => setForm((f) => ({ ...f, subCounty: v as SubCounty }))}>
        <SelectTrigger><SelectValue placeholder="Select sub-county" /></SelectTrigger>
        <SelectContent>{SUB_COUNTIES.map((sc) => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

  const genderSelect = (
    <div className="space-y-1.5">
      <Label>Gender <span className="text-muted-foreground text-xs ml-1">(optional)</span></Label>
      <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v as "M" | "F" }))}>
        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="M">Male</SelectItem>
          <SelectItem value="F">Female</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleAdd = async () => {
    setError("");
    if (!form.name || !form.memberNo || !form.school || !form.phone || !form.password) {
      setError("Name, TSC No, school, phone and password are required."); return;
    }
    setSaving(true);
    try {
      await adminService.addMember({
        name: form.name, surname: form.surname || undefined, gender: form.gender || undefined,
        email: form.email || undefined, memberNo: form.memberNo,
        school: form.school, phone: form.phone,
        subCounty: form.subCounty || undefined, zone: form.zone || undefined,
        role: form.role, password: form.password,
      });
      setAddOpen(false); setForm(EMPTY_FORM); load(1, pageSize, committed); setPage(1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add member.");
    } finally { setSaving(false); }
  };

  const openEdit = (m: User) => {
    setEditTarget(m);
    setForm({ name: m.name, surname: m.surname ?? "", gender: m.gender ?? "",
      email: m.email ?? "", memberNo: m.memberNo, school: m.school,
      phone: m.phone, password: "", subCounty: m.subCounty ?? "", zone: m.zone ?? "",
      role: m.role as "admin" | "member" });
    setError(""); setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setError("");
    if (!form.name || !form.school || !form.phone) { setError("Name, school and phone are required."); return; }
    setSaving(true);
    try {
      const updated = await adminService.updateMember(editTarget.id, {
        name: form.name, surname: form.surname || undefined, gender: form.gender || undefined,
        email: form.email || undefined, school: form.school, phone: form.phone,
        subCounty: form.subCounty || undefined, zone: form.zone || undefined,
        role: form.role,
      });
      setMembers((prev) => prev.map((m) => m.id === editTarget.id ? { ...m, ...updated } : m));
      setEditOpen(false);
    } catch { setError("Failed to update member."); }
    finally { setSaving(false); }
  };

  const handleToggle = async (member: User) => {
    try {
      await confirm({
        title: `${member.active ? "Disable" : "Enable"} ${member.name}?`,
        description: member.active ? "This member will no longer be able to log in." : "This member will regain access to the portal.",
        confirmLabel: member.active ? "Disable" : "Enable",
        variant: member.active ? "destructive" : "default",
      });
    } catch { return; }
    setSaving(true);
    try {
      if (member.active) await adminService.disableMember(member.id);
      else await adminService.enableMember(member.id);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (member: User) => {
    try {
      await confirm({
        title: `Delete ${member.name}?`,
        description: "This permanently removes the user and all their data. This cannot be undone.",
        confirmLabel: "Delete",
        variant: "destructive",
      });
    } catch { return; }
    setSaving(true);
    try {
      await adminService.deleteMember(member.id);
      load();
    } finally { setSaving(false); }
  };

  const downloadTemplate = () => {
    const csv = "Name,Surname,TSC_No,MobileNo,School,SubCounty,Zone,Gender,Email\n";
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a   = document.createElement("a");
    a.href = url; a.download = "members_import_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMsg(""); setImporting(true);
    try {
      const { imported, skipped } = await adminService.bulkImportMembers(file);
      setImportMsg(`✓ Imported ${imported} member(s). ${skipped} skipped (duplicates).`);
      load(1, pageSize, committed); setPage(1);
    } catch (err) {
      setImportMsg(err instanceof Error ? err.message : "Failed to process file.");
    } finally { setImporting(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  // ── Pagination bar ─────────────────────────────────────────────────────────

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows per page:</span>
        <Select value={String(pageSize)} onValueChange={handlePageSize}>
          <SelectTrigger className="h-8 w-16 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{PAGE_SIZES.map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <span className="ml-2">
          {total === 0 ? "0 results" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total.toLocaleString()}`}
        </span>
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
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Members</h1>
            <p className="text-sm text-muted-foreground">
              {total.toLocaleString()} registered users
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => load()}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              title="Download import template"
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? "Importing…" : "Import"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,.os,.tsv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              onClick={() => {
                setForm(EMPTY_FORM);
                setError("");
                setAddOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Member
            </Button>
          </div>
        </div>

        {importMsg && (
          <p
            className={cn(
              "text-sm px-1",
              importMsg.startsWith("✓") ? "text-green-600" : "text-destructive",
            )}
          >
            {importMsg}
          </p>
        )}

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Member Directory</CardTitle>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, TSC no, school, sub-county… then press Enter"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKey}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                variant="secondary"
                className="shrink-0"
              >
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
              {committed && (
                <Button
                  variant="ghost"
                  className="shrink-0 text-muted-foreground"
                  onClick={() => {
                    setSearch("");
                    setCommitted("");
                    setPage(1);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {[
                      "Name",
                      "Surname",
                      "TSC No",
                      "School",
                      "Sub-County",
                      "Zone",
                      "Phone",
                      "Role",
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
                        colSpan={10}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Loading…
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        {committed
                          ? `No members found for "${committed}".`
                          : "No members found."}
                      </td>
                    </tr>
                  ) : (
                    members.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                          {m.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {m.surname ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {m.memberNo}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {m.school}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {m.subCounty ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {m.zone ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {m.phone}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              m.role === "admin" ? "default" : "secondary"
                            }
                            className="capitalize"
                          >
                            {m.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={m.active ? "default" : "secondary"}>
                            {m.active ? "Active" : "Disabled"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(m)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleToggle(m)}
                            >
                              {m.active ? (
                                <UserX className="h-3.5 w-3.5 text-destructive" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5 text-success" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDelete(m)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination />
          </CardContent>
        </Card>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              {field("name", "First Name")}
              {field("surname", "Surname", "text", false)}
            </div>
            {field("memberNo", "TSC No")}
            {roleSelect}
            {genderSelect}
            {field("school", "School / Station")}
            {field("phone", "Phone")}
            {field("email", "Email", "email", false)}
            {subCountySelect}
            {field("zone", "Zone", "text", false)}
            {field("password", "Password", "password")}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? "Saving…" : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              {field("name", "First Name")}
              {field("surname", "Surname", "text", false)}
            </div>
            {genderSelect}
            {roleSelect}
            {field("school", "School / Station")}
            {field("phone", "Phone")}
            {field("email", "Email", "email", false)}
            {subCountySelect}
            {field("zone", "Zone", "text", false)}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Members;
