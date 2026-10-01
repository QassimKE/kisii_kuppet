import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, RefreshCw, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import logo from "/logo.png";

const generateCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

type ForgotStep = "email" | "otp" | "reset";

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    from?: { pathname: string };
    resetPassword?: boolean;
    tscNo?: string;
  } | null;
  const from = locationState?.from?.pathname;

  // Login state
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [showPassword, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(() => !!locationState?.resetPassword);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [fpMethod, setFpMethod]     = useState<"email" | "phone">("email");
  const [fpEmail, setFpEmail]       = useState("");
  const [fpPhone, setFpPhone]       = useState("");
  const [fpOtp, setFpOtp]           = useState("");
  const [fpNewPw, setFpNewPw]       = useState("");
  const [fpConfirm, setFpConfirm]   = useState("");
  const [showFpPw, setShowFpPw]     = useState(false);
  const [fpLoading, setFpLoading]   = useState(false);

  const [username, setUsername] = useState(locationState?.tscNo ?? "");

  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput("");
  }, []);
  useEffect(() => { refreshCaptcha(); }, [refreshCaptcha]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from ?? (user.role === "admin" ? "/admin-dashboard" : "/member-dashboard"), { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput !== captchaCode) {
      toast.error("Invalid verification code. Please try again.");
      refreshCaptcha(); return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.success("Login successful!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed.");
      refreshCaptcha();
    } finally { setLoading(false); }
  };

  // ── Forgot password handlers ───────────────────────────────────────────────
  const fpContact = fpMethod === "email" ? { email: fpEmail } : { phone: fpPhone };

  const openForgot = () => {
    setForgotOpen(true); setForgotStep("email");
    setFpMethod("email"); setFpEmail(""); setFpPhone("");
    setFpOtp(""); setFpNewPw(""); setFpConfirm("");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpLoading(true);
    try {
      await authService.sendVerificationCode(fpContact);
      toast.success(`A 6-digit reset code has been sent via ${fpMethod === "email" ? "email" : "SMS"}.`);
      setForgotStep("otp");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send code.");
    } finally { setFpLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpLoading(true);
    try {
      await authService.verifyCode(fpContact, fpOtp);
      setForgotStep("reset");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid code.");
    } finally { setFpLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fpNewPw.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (fpNewPw !== fpConfirm) { toast.error("Passwords do not match."); return; }
    setFpLoading(true);
    try {
      await authService.resetPassword(fpContact, fpNewPw);
      toast.success("Password reset successfully. You can now log in.");
      setForgotOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Reset failed.");
    } finally { setFpLoading(false); }
  };

  // ── Forgot password panel ──────────────────────────────────────────────────
  const forgotPanel = (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <button
          type="button"
          onClick={() => forgotStep === "email" ? setForgotOpen(false) : setForgotStep(forgotStep === "otp" ? "email" : "otp")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <h1 className="text-xl font-bold text-foreground">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          {forgotStep === "email" && "Choose how to receive your reset code."}
          {forgotStep === "otp"   && `Enter the 6-digit code sent to your ${fpMethod === "email" ? "email" : "phone"}.`}
          {forgotStep === "reset" && "Choose a new password."}
        </p>
      </CardHeader>
      <CardContent>
        {forgotStep === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="flex rounded-md border border-input overflow-hidden">
              <button type="button" onClick={() => setFpMethod("email")}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  fpMethod === "email" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                }`}>
                Email
              </button>
              <button type="button" onClick={() => setFpMethod("phone")}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  fpMethod === "phone" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                }`}>
                Phone (SMS)
              </button>
            </div>
            {fpMethod === "email" ? (
              <div className="space-y-2">
                <Label htmlFor="fp-email">Email Address</Label>
                <Input id="fp-email" type="email" placeholder="you@school.ac.ke" value={fpEmail} onChange={(e) => setFpEmail(e.target.value)} required />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="fp-phone">Registered Phone Number</Label>
                <Input id="fp-phone" type="tel" placeholder="07XXXXXXXX or +2547XXXXXXXX" value={fpPhone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    if (!digits) { setFpPhone(""); return; }
                    if (digits.startsWith("254")) setFpPhone(`+${digits}`);
                    else if (digits.startsWith("0")) setFpPhone(`+254${digits.slice(1)}`);
                    else setFpPhone(`+254${digits}`);
                  }}
                  required />
                <p className="text-xs text-muted-foreground">Must match the phone number on your account.</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={fpLoading}>
              {fpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send Reset Code
            </Button>
          </form>
        )}

        {forgotStep === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fp-otp">Verification Code</Label>
              <Input
                id="fp-otp" placeholder="6-digit code" maxLength={6}
                value={fpOtp} onChange={(e) => setFpOtp(e.target.value)} required
              />
              <p className="text-xs text-muted-foreground">
                Didn't receive it?{" "}
                <button type="button" className="text-primary hover:underline" onClick={handleSendOtp}>
                  Resend code
                </button>
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={fpLoading}>
              {fpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Verify Code
            </Button>
          </form>
        )}

        {forgotStep === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fp-newpw">New Password</Label>
              <div className="relative">
                <Input
                  id="fp-newpw" type={showFpPw ? "text" : "password"}
                  placeholder="Min. 6 characters" value={fpNewPw}
                  onChange={(e) => setFpNewPw(e.target.value)} required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowFpPw(!showFpPw)}>
                  {showFpPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fp-confirm">Confirm Password</Label>
              <Input id="fp-confirm" type="password" placeholder="Repeat password" value={fpConfirm} onChange={(e) => setFpConfirm(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={fpLoading}>
              {fpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reset Password
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src={logo} alt="Kisii KUPPET" className="h-10 w-10 rounded-lg object-contain" />
          <span className="font-heading text-xl font-bold text-primary-foreground">Kisii KUPPET</span>
        </Link>

        {forgotOpen ? forgotPanel : (
          <>
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-2">
                <h1 className="text-xl font-bold text-foreground">Dashboard Login</h1>
                <p className="text-sm text-muted-foreground">Enter your credentials to access the portal</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">TSC No</Label>
                    <Input id="username" placeholder="Enter your TSC No" value={username} onChange={(e) => setUsername(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={openForgot}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPw(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 min-w-[140px] select-none items-center justify-center rounded-md px-4 font-mono text-lg font-bold tracking-[0.3em] text-foreground"
                        style={{ background: "repeating-linear-gradient(45deg, hsl(var(--muted)), hsl(var(--muted)) 10px, hsl(var(--muted-foreground) / 0.05) 10px, hsl(var(--muted-foreground) / 0.05) 20px)" }}
                      >
                        {captchaCode}
                      </div>
                      <button type="button" onClick={refreshCaptcha} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Refresh code">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                    <Input placeholder="Enter the code above" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Log In
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-sm text-primary-foreground/60">
              New member?{" "}
              <Link to="/register" className="font-medium text-primary-foreground hover:underline">Register here</Link>
            </p>

            {import.meta.env.VITE_USE_MOCK === "true" && (
              <div className="mt-4 rounded-lg border border-primary-foreground/20 bg-primary-foreground/5 p-4 text-xs text-primary-foreground/70 backdrop-blur-sm">
                <p className="font-semibold text-primary-foreground/90 mb-2">🧪 Test Credentials (Mock Mode)</p>
                <div className="space-y-1">
                  <p><span className="font-medium">Admin:</span> TSC No <code className="bg-primary-foreground/10 px-1 rounded">ADM-001</code> / any password</p>
                  <p><span className="font-medium">Member:</span> TSC No <code className="bg-primary-foreground/10 px-1 rounded">MEM-001</code> / any password</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
