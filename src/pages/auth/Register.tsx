import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import type { SubCounty } from "@/services/types";
import logo from "/logo.png";

const SUB_COUNTIES: SubCounty[] = [
  "Ithanga-Kakuzi", "Gatanga", "Kandara", "Kisii South",
  "Kigumo", "Kisii East", "Kahuro", "Mathioya", "Kangema",
];

// Steps:
//  tsc         — enter TSC number
//  set-password — existing bulk-imported account, set a password
//  form        — brand new account, fill in details
//  verify      — OTP verification (new account with email)
type Step = "tsc" | "set-password" | "form" | "verify";

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep]       = useState<Step>("tsc");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [otp, setOtp]         = useState("");

  const [memberNo, setMemberNo] = useState("");

  // For set-password step (existing account)
  const [setPwForm, setSetPwForm] = useState({ password: "", confirm: "" });

  // For new registration form
  const [form, setForm] = useState({
    name: "", school: "", phone: "",
    email: "", password: "", confirm: "",
    subCounty: "" as SubCounty | "", zone: "",
  });

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // ── Step 1: check TSC ──────────────────────────────────────────────────────
  const handleCheckTsc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberNo.trim()) { toast.error("Please enter your TSC number."); return; }
    setLoading(true);
    try {
      const result = await authService.checkTsc(memberNo.trim());
      if (result.exists) {
        if (result.hasPassword) {
          // Account exists with password — send to login with reset panel open
          navigate("/login", { state: { resetPassword: true, tscNo: memberNo.trim() } });
        } else {
          // Bulk-imported account — let them set a password
          setStep("set-password");
        }
      } else {
        // No account — proceed to full registration
        setStep("form");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to check TSC number.");
    } finally { setLoading(false); }
  };

  // ── Step 2a: set password for existing account ─────────────────────────────
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setPwForm.password !== setPwForm.confirm) { toast.error("Passwords do not match."); return; }
    if (setPwForm.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await authService.setPassword(memberNo.trim(), setPwForm.password);
      toast.success("Password set successfully! You can now log in.");
      navigate("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to set password.");
    } finally { setLoading(false); }
  };

  // ── Step 2b: submit new registration form ──────────────────────────────────
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords do not match."); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      if (form.email) {
        await authService.sendRegistrationCode(form.email);
        toast.success("A 6-digit verification code has been sent to your email.");
        setStep("verify");
      } else {
        await authService.register({
          name: form.name, memberNo: memberNo.trim(),
          school: form.school, phone: form.phone, email: undefined,
          subCounty: form.subCounty || undefined, zone: form.zone || undefined,
          role: "member", password: form.password,
        });
        toast.success("Registration successful! Please log in.");
        navigate("/login");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to register.");
    } finally { setLoading(false); }
  };

  // ── Step 3: verify OTP then register ──────────────────────────────────────
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.verifyCode(form.email, otp);
      await authService.register({
        name: form.name, memberNo: memberNo.trim(),
        school: form.school, phone: form.phone, email: form.email,
        subCounty: form.subCounty || undefined, zone: form.zone || undefined,
        role: "member", password: form.password,
      });
      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Verification failed.");
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await authService.sendRegistrationCode(form.email);
      toast.success("A new code has been sent.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resend.");
    } finally { setLoading(false); }
  };

  const Logo = () => (
    <Link to="/" className="mb-8 flex items-center justify-center gap-2">
      <img src={logo} alt="KUPPET" className="h-10 w-10 rounded-lg object-contain" />
      <span className="font-heading text-xl font-bold text-primary-foreground">Kisii KUPPET</span>
    </Link>
  );

  const BackButton = ({ to }: { to: Step }) => (
    <button
      type="button"
      onClick={() => setStep(to)}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Back
    </button>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        <Logo />

        {/* ── Step: TSC lookup ── */}
        {step === "tsc" && (
          <>
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-2">
                <h1 className="text-xl font-bold text-foreground">Get Started</h1>
                <p className="text-sm text-muted-foreground">Enter your TSC number to continue</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckTsc} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberNo">TSC Number</Label>
                    <Input
                      id="memberNo" placeholder="e.g. 12345"
                      value={memberNo} onChange={(e) => setMemberNo(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Next
                  </Button>
                </form>
              </CardContent>
            </Card>
            <p className="mt-6 text-center text-sm text-primary-foreground/60">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary-foreground hover:underline">Log in</Link>
            </p>
          </>
        )}

        {/* ── Step: set password (existing bulk-imported account) ── */}
        {step === "set-password" && (
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <BackButton to="tsc" />
              <h1 className="text-xl font-bold text-foreground">Set Your Password</h1>
              <p className="text-sm text-muted-foreground">
                We found an account for <span className="font-medium text-foreground">{memberNo}</span>.
                Set a password to activate it.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sp-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="sp-password" type={showPw ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={setPwForm.password}
                      onChange={(e) => setSetPwForm((f) => ({ ...f, password: e.target.value }))}
                      required
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sp-confirm">Confirm Password</Label>
                  <Input
                    id="sp-confirm" type="password" placeholder="Repeat password"
                    value={setPwForm.confirm}
                    onChange={(e) => setSetPwForm((f) => ({ ...f, confirm: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Activate Account
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ── Step: full registration form (new account) ── */}
        {step === "form" && (
          <>
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-2">
                <BackButton to="tsc" />
                <h1 className="text-xl font-bold text-foreground">Member Registration</h1>
                <p className="text-sm text-muted-foreground">TSC: <span className="font-medium text-foreground">{memberNo}</span></p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Jane Wanjiku" value={form.name} onChange={setF("name")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school">School / Institution</Label>
                    <Input id="school" placeholder="Kisii High School" value={form.school} onChange={setF("school")} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sub-County <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Select value={form.subCounty} onValueChange={(v) => setForm((f) => ({ ...f, subCounty: v as SubCounty }))}>
                        <SelectTrigger><SelectValue placeholder="Select sub-county" /></SelectTrigger>
                        <SelectContent>
                          {SUB_COUNTIES.map((sc) => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zone">Zone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Input id="zone" placeholder="e.g. Zone A" value={form.zone} onChange={setF("zone")} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+254700000000" value={form.phone} onChange={setF("phone")} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Input id="email" type="email" placeholder="you@school.ac.ke" value={form.email} onChange={setF("email")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input id="password" type={showPw ? "text" : "password"} placeholder="Min. 6 characters" value={form.password} onChange={setF("password")} required />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPw(!showPw)}>
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <Input id="confirm" type={showPw2 ? "text" : "password"} placeholder="Repeat password" value={form.confirm} onChange={setF("confirm")} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                  </Button>
                </form>
              </CardContent>
            </Card>
            <p className="mt-6 text-center text-sm text-primary-foreground/60">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary-foreground hover:underline">Log in</Link>
            </p>
          </>
        )}

        {/* ── Step: OTP verification ── */}
        {step === "verify" && (
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <BackButton to="form" />
              <div className="flex flex-col items-center gap-2 pt-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <MailCheck className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Verify Your Email</h1>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-medium text-foreground">{form.email}</span>
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp" placeholder="6-digit code" maxLength={6}
                    value={otp} onChange={(e) => setOtp(e.target.value)}
                    className="text-center text-lg tracking-widest font-mono"
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Didn't receive it?{" "}
                    <button type="button" className="text-primary hover:underline" onClick={handleResend} disabled={loading}>
                      Resend code
                    </button>
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Create Account
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Register;
