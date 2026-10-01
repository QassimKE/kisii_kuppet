import { useEffect, useState } from "react";
import MemberLayout from "@/components/member/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Lock, Users, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { memberService } from "@/services/member.service";
import type { Beneficiary, BeneficiaryRelationship, SubCounty } from "@/services/types";

const SUB_COUNTIES: SubCounty[] = [
  "Ithanga-Kakuzi", "Gatanga", "Kandara", "Kisii South",
  "Kigumo", "Kisii East", "Kahuro", "Mathioya", "Kangema",
];

const RELATIONSHIPS: BeneficiaryRelationship[] = [
  "Legal Spouse", "Biological Child", "Biological Father",
  "Biological Mother", "Biological Father-in-law", "Biological Mother-in-law",
];

const EMPTY_BEN: Omit<Beneficiary, "id"> = { name: "", relationship: "Legal Spouse", idNumber: "", phone: "", birthCertNo: "" };

const Profile = () => {
  const { user } = useAuth();

  const [saving, setSaving]         = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [savingBen, setSavingBen]   = useState(false);

  const [form, setForm] = useState({
    name:       user?.name       ?? "",
    surname:    user?.surname    ?? "",
    gender:     user?.gender     ?? "" as "M" | "F" | "",
    phone:      user?.phone      ?? "",
    school:     user?.school     ?? "",
    email:      user?.email      ?? "",
    subCounty:  user?.subCounty  ?? "" as SubCounty | "",
    zone:       user?.zone       ?? "",
  });

  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [newBen, setNewBen]               = useState<Omit<Beneficiary, "id">>(EMPTY_BEN);

  useEffect(() => {
    if (user) memberService.getBeneficiaries(user.id).then(setBeneficiaries);
  }, [user]);

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await memberService.updateProfile(user.id, {
        name:       form.name,
        surname:    form.surname    || undefined,
        gender:     form.gender     || undefined,
        phone:      form.phone,
        school:     form.school,
        email:      form.email      || undefined,
        subCounty:  form.subCounty  || undefined,
        zone:       form.zone       || undefined,
      });
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update profile.");
    } finally { setSaving(false); }
  };

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPw !== pw.confirm) { toast.error("New passwords do not match."); return; }
    if (pw.newPw.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setChangingPw(true);
    try {
      await memberService.changePassword(user!.id, pw.current, pw.newPw);
      toast.success("Password changed successfully.");
      setPw({ current: "", newPw: "", confirm: "" });
    } catch {
      toast.error("Failed to change password.");
    } finally { setChangingPw(false); }
  };

  const addBeneficiary = () => {
    if (!newBen.name) { toast.error("Beneficiary name is required."); return; }
    setBeneficiaries((prev) => [...prev, { ...newBen, id: `ben-${Date.now()}` }]);
    setNewBen(EMPTY_BEN);
  };

  const removeBeneficiary = (id: string) =>
    setBeneficiaries((prev) => prev.filter((b) => b.id !== id));

  const handleSaveBeneficiaries = async () => {
    if (!user) return;
    setSavingBen(true);
    try {
      await memberService.saveBeneficiaries(user.id, beneficiaries);
      toast.success("Beneficiaries saved.");
    } catch {
      toast.error("Failed to save beneficiaries.");
    } finally { setSavingBen(false); }
  };

  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account information</p>
        </div>

        {/* Membership Details */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" /> Membership Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground">TSC No</p><p className="font-semibold text-foreground">{user?.memberNo}</p></div>
            <div><p className="text-muted-foreground">Personal No</p><p className="font-medium text-foreground">{user?.personalNo ?? "—"}</p></div>
            <div><p className="text-muted-foreground">Role</p><Badge variant="secondary" className="capitalize">{user?.role}</Badge></div>
            <div><p className="text-muted-foreground">Join Date</p><p className="font-medium text-foreground">{user?.joinDate}</p></div>
            <div><p className="text-muted-foreground">Status</p><Badge className={user?.active ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>{user?.active ? "Active" : "Disabled"}</Badge></div>
          </CardContent>
        </Card>

        {/* Edit Information */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Edit Information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">First Name</Label>
                  <Input id="name" value={form.name} onChange={setF("name")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Surname</Label>
                  <Input id="surname" value={form.surname} onChange={setF("surname")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v as "M" | "F" }))}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={setF("phone")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input id="email" type="email" value={form.email} onChange={setF("email")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">School / Institution</Label>
                <Input id="school" value={form.school} onChange={setF("school")} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sub-County</Label>
                  <Select value={form.subCounty} onValueChange={(v) => setForm((f) => ({ ...f, subCounty: v as SubCounty }))}>
                    <SelectTrigger><SelectValue placeholder="Select sub-county" /></SelectTrigger>
                    <SelectContent>
                      {SUB_COUNTIES.map((sc) => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zone">Zone</Label>
                  <Input id="zone" value={form.zone} onChange={setF("zone")} />
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Beneficiaries */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" /> Beneficiaries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {beneficiaries.length > 0 && (
              <div className="space-y-2">
                {beneficiaries.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium text-foreground">{b.name}</span>
                      <span className="ml-2 text-muted-foreground">— {b.relationship}</span>
                      {b.idNumber && <span className="ml-2 text-muted-foreground text-xs">ID: {b.idNumber}</span>}
                      {b.birthCertNo && <span className="ml-2 text-muted-foreground text-xs">BC: {b.birthCertNo}</span>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeBeneficiary(b.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new beneficiary */}
            <div className="rounded-md border border-dashed border-border p-3 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Add Beneficiary</p>
              <div className="space-y-1.5">
                <Label className="text-xs">Relationship</Label>
                <Select value={newBen.relationship} onValueChange={(v) => setNewBen((b) => ({ ...b, relationship: v as BeneficiaryRelationship }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <Input placeholder="Beneficiary name" value={newBen.name} onChange={(e) => setNewBen((b) => ({ ...b, name: e.target.value }))} />
              </div>
              {newBen.relationship === "Biological Child" ? (
                <div className="space-y-1.5">
                  <Label className="text-xs">Birth Cert No.</Label>
                  <Input placeholder="Birth certificate number" value={newBen.birthCertNo ?? ""} onChange={(e) => setNewBen((b) => ({ ...b, birthCertNo: e.target.value }))} />
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">ID Number</Label>
                    <Input placeholder="National ID number" value={newBen.idNumber ?? ""} onChange={(e) => setNewBen((b) => ({ ...b, idNumber: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone Number</Label>
                    <Input placeholder="+254700000000" value={newBen.phone ?? ""} onChange={(e) => setNewBen((b) => ({ ...b, phone: e.target.value }))} />
                  </div>
                </>
              )}
              <Button type="button" variant="outline" size="sm" onClick={addBeneficiary}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>

            <Button onClick={handleSaveBeneficiaries} disabled={savingBen}>
              {savingBen && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Beneficiaries
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4 text-primary" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePw} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPw">New Password</Label>
                  <Input id="newPw" type="password" value={pw.newPw} onChange={(e) => setPw((p) => ({ ...p, newPw: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} required />
                </div>
              </div>
              <Button type="submit" variant="secondary" disabled={changingPw}>
                {changingPw && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
};

export default Profile;
