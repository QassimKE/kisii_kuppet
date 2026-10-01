import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { memberService } from "@/services/member.service";

const AdminProfile = () => {
  const { user } = useAuth();

  const [saving, setSaving]         = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const [form, setForm] = useState({
    name:    user?.name    ?? "",
    surname: user?.surname ?? "",
    phone:   user?.phone   ?? "",
    school:  user?.school  ?? "",
    email:   user?.email   ?? "",
  });

  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await memberService.updateProfile(user.id, {
        name:    form.name,
        surname: form.surname || undefined,
        phone:   form.phone,
        school:  form.school,
        email:   form.email   || undefined,
      });
      toast.success("Profile updated successfully.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally { setSaving(false); }
  };

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPw !== pw.confirm) { toast.error("New passwords do not match."); return; }
    if (pw.newPw.length < 6)     { toast.error("Password must be at least 6 characters."); return; }
    setChangingPw(true);
    try {
      await memberService.changePassword(user!.id, pw.current, pw.newPw);
      toast.success("Password changed successfully.");
      setPw({ current: "", newPw: "", confirm: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password.");
    } finally { setChangingPw(false); }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account information</p>
        </div>

        {/* Account Details (read-only) */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="h-4 w-4 text-primary" /> Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground">TSC / Staff No</p><p className="font-semibold text-foreground">{user?.memberNo ?? "—"}</p></div>
            <div><p className="text-muted-foreground">Role</p><Badge className="bg-primary/10 text-primary border-primary/20 capitalize">{user?.role}</Badge></div>
            <div><p className="text-muted-foreground">Join Date</p><p className="font-medium text-foreground">{user?.joinDate ?? "—"}</p></div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge className={user?.active ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                {user?.active ? "Active" : "Disabled"}
              </Badge>
            </div>
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
                <Label htmlFor="school">Institution</Label>
                <Input id="school" value={form.school} onChange={setF("school")} required />
              </div>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </Button>
            </form>
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
                <div className="relative">
                  <Input
                    id="current"
                    type={showCurrent ? "text" : "password"}
                    value={pw.current}
                    onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrent((v) => !v)}
                  >
                    {showCurrent ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPw">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPw"
                      type={showNew ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={pw.newPw}
                      onChange={(e) => setPw((p) => ({ ...p, newPw: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNew((v) => !v)}
                    >
                      {showNew ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Repeat password"
                    value={pw.confirm}
                    onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <Button type="submit" variant="secondary" disabled={changingPw}>
                {changingPw && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
