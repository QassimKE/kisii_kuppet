import { useState, useEffect, useRef } from "react";
import MemberLayout from "@/components/member/MemberLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { memberService } from "@/services/member.service";
import type { Claim, BeneficiaryRelationship, ClaimCategory, User } from "@/services/types";
import { CLAIM_AMOUNTS } from "@/services/types";

const RELATIONSHIPS: BeneficiaryRelationship[] = [
  "Legal Spouse", "Biological Child", "Biological Father",
  "Biological Mother", "Biological Father-in-law", "Biological Mother-in-law",
];

const CATEGORIES: ClaimCategory[] = ["Self", "Spouse", "Child", "Parent"];

type Filter = "all" | "pending" | "approved" | "rejected";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const statusColors: Record<string, string> = {
  approved: "bg-success text-success-foreground",
  pending:  "bg-warning text-warning-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

const Claims = () => {
  const { user } = useAuth();
  const [claimant, setClaimant]     = useState("");
  const [tscSearch, setTscSearch]   = useState("");
  const [members, setMembers]       = useState<User[]>([]);
  const [matches, setMatches]       = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef                 = useRef<HTMLDivElement>(null);
  const submittingRef               = useRef(false);
  const [relationship, setRelation] = useState<BeneficiaryRelationship | "">("");
  const [category, setCategory]     = useState<ClaimCategory | "">("");
  const [details, setDetails]       = useState("");
  const [burialPermit, setBurial]   = useState<File | null>(null);
  const [payslip, setPayslip]       = useState<File | null>(null);
  const [loading, setLoading]       = useState(false);
  const [claims, setClaims]         = useState<Claim[]>([]);
  const [filter, setFilter]         = useState<Filter>("all");

  useEffect(() => {
    if (!user) return;
    memberService.getClaims(user.id).then(setClaims);
    memberService.getMembers().then(setMembers);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleTscSearch = (val: string) => {
    setTscSearch(val);
    setClaimant("");
    if (val.trim().length < 2) { setMatches([]); setShowDropdown(false); return; }
    const filtered = members.filter((m) =>
      m.memberNo.toLowerCase().includes(val.toLowerCase())
    );
    setMatches(filtered);
    setShowDropdown(filtered.length > 0);
  };

  const selectMember = (m: User) => {
    setClaimant(`${m.name}${m.surname ? " " + m.surname : ""}`);
    setTscSearch(m.memberNo);
    setShowDropdown(false);
  };

  const validateFile = (file: File, label: string): boolean => {
    if (file.size > MAX_FILE_SIZE) { toast.error(`${label} exceeds 5MB limit.`); return false; }
    return true;
  };

  const handleBurial = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && !validateFile(f, "Burial Permit")) { e.target.value = ""; return; }
    setBurial(f);
  };

  const handlePayslip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && !validateFile(f, "Payslip")) { e.target.value = ""; return; }
    setPayslip(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimant) { toast.error("Please select a claimant by searching their TSC number."); return; }
    if (!relationship || !category) { toast.error("Please select relationship and category."); return; }
    if (!burialPermit || !payslip) { toast.error("Please upload both required documents."); return; }
    if (!user) return;

    // Check for duplicate pending claims
    const hasPendingClaim = claims.some(
      (c) => c.status === "pending" && c.claimant === claimant && c.type.includes(category)
    );
    if (hasPendingClaim) {
      toast.error(`You already have a pending ${category} claim for ${claimant}. Please wait for it to be processed.`);
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      const newClaim = await memberService.submitClaim(
        { claimant, relationship, category, details, claimantTsc: tscSearch || undefined },
        { burialPermit: burialPermit ?? undefined, payslip: payslip ?? undefined }
      );
      setClaims((prev) => [newClaim, ...prev]);
      toast.success(`Claim ${newClaim.id} submitted successfully.`);
      setClaimant(""); setRelation(""); setCategory(""); setDetails(""); setBurial(null); setPayslip(null);
      setTscSearch(""); setMatches([]);
      (document.getElementById("burial-permit") as HTMLInputElement).value = "";
      (document.getElementById("payslip-input") as HTMLInputElement).value = "";
    } catch {
      toast.error("Failed to submit claim.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const filtered = claims.filter((c) => filter === "all" || c.status === filter);
  const filters: Filter[] = ["all", "pending", "approved", "rejected"];

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Claims</h1>
          <p className="text-sm text-muted-foreground">Submit welfare claims and track their progress.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-primary" /> Submit New Claim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tsc-search">Claimant TSC No</Label>
                  <div className="relative" ref={dropdownRef}>
                    <Input
                      id="tsc-search"
                      placeholder="Type TSC number to search…"
                      value={tscSearch}
                      onChange={(e) => handleTscSearch(e.target.value)}
                      autoComplete="off"
                    />
                    {showDropdown && (
                      <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
                        {matches.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex justify-between"
                            onClick={() => selectMember(m)}
                          >
                            <span className="font-medium">{m.memberNo}</span>
                            <span className="text-muted-foreground">{m.name}{m.surname ? " " + m.surname : ""}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {claimant && (
                    <p className="text-xs text-success">✓ {claimant}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Relationship to Deceased</Label>
                  <Select value={relationship} onValueChange={(v) => setRelation(v as BeneficiaryRelationship)}>
                    <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Claim Category</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as ClaimCategory)}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c} — {CLAIM_AMOUNTS[c]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Claim Amount</Label>
                    <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium text-foreground">
                      {category ? CLAIM_AMOUNTS[category] : "—"}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details">Claim Details</Label>
                  <Textarea id="details" placeholder="Provide additional details..." rows={3} value={details} onChange={(e) => setDetails(e.target.value)} required />
                </div>
                <div className="rounded-lg border-2 border-dashed border-border p-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 text-warning" /> Both documents are mandatory (max 5MB each)
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="burial-permit" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Burial Permit (PDF, JPG, PNG)
                    </Label>
                    <Input id="burial-permit" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleBurial} required />
                    {burialPermit && <p className="text-xs text-success">✓ {burialPermit.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payslip-input" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Latest Payslip — within 30 days (PDF, JPG, PNG)
                    </Label>
                    <Input id="payslip-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handlePayslip} required />
                    {payslip && <p className="text-xs text-success">✓ {payslip.name}</p>}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Claim
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">My Claims</h2>
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
              {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No claims found.</p>}
              {filtered.map((c) => (
                <Card key={c.id} className="shadow-card">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{c.type}</p>
                        <p className="text-xs text-muted-foreground">{c.id} · {c.createdAt} · {c.amount}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Claimant: {c.claimant}{c.claimantTsc ? ` · TSC: ${c.claimantTsc}` : ""} ({c.relationship})</p>
                      </div>
                      <Badge className={cn("shrink-0", statusColors[c.status])}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </Badge>
                    </div>
                    {c.remarks && (
                      <div className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-warning" />
                        <span>{c.remarks}</span>
                      </div>
                    )}
                    {c.documents.length > 0 && (
                      <p className="text-xs text-muted-foreground">📎 {c.documents.length} document{c.documents.length > 1 ? "s" : ""} attached</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default Claims;
