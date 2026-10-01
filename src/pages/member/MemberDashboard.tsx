import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MemberLayout from "@/components/member/MemberLayout";
import StatCard from "@/components/public/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileText, Bus, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/context/AuthContext";
import { memberService } from "@/services/member.service";
import type { MemberStats, Claim } from "@/services/types";

const statusColors: Record<string, string> = {
  approved: "bg-success text-success-foreground",
  pending:  "bg-warning text-warning-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

const MemberDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]   = useState<MemberStats | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    if (!user) return;
    memberService.getMemberStats(user.id).then(setStats);
    memberService.getClaims(user.id).then((c) => setClaims(c.slice(0, 3)));
  }, [user]);

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{user?.school} · {user?.memberNo}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Bus}          title="Days Booked"       value={stats?.daysBookedThisYear ?? "—"} subtitle="This year" />
          <StatCard icon={CalendarDays} title="Upcoming Bookings" value={stats?.upcomingBookings   ?? "—"} subtitle="Pending / approved" />
          <StatCard icon={FileText}     title="Total Claims"      value={stats?.totalClaims        ?? "—"} subtitle="All time" />
          <StatCard icon={CheckCircle}  title="Approved Claims"   value={stats?.approvedClaims     ?? "—"} subtitle="Processed" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Booking History (This Year)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats?.monthlyBookings ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Claims</CardTitle>
              <Button variant="ghost" size="sm" asChild><Link to="/claims">View All</Link></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {claims.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No claims yet.</p>}
              {claims.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.id}</p>
                    <p className="text-xs text-muted-foreground">{c.createdAt} · {c.amount}</p>
                  </div>
                  <Badge className={statusColors[c.status]}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {stats && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="shadow-card text-center p-4">
              <p className="text-2xl font-bold text-warning">{stats.pendingClaims}</p>
              <p className="text-sm text-muted-foreground mt-1">Pending Claims</p>
            </Card>
            <Card className="shadow-card text-center p-4">
              <p className="text-2xl font-bold text-success">{stats.approvedClaims}</p>
              <p className="text-sm text-muted-foreground mt-1">Approved Claims</p>
            </Card>
            <Card className="shadow-card text-center p-4">
              <p className="text-2xl font-bold text-destructive">{stats.rejectedClaims}</p>
              <p className="text-sm text-muted-foreground mt-1">Rejected Claims</p>
            </Card>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Button size="lg" className="h-auto py-4 flex-col gap-1" asChild>
            <Link to="/van-booking"><Bus className="h-5 w-5" />Book Van</Link>
          </Button>
          <Button size="lg" variant="secondary" className="h-auto py-4 flex-col gap-1 bg-destructive text-destructive-foreground hover:bg-destructive/90" asChild>
            <Link to="/claims"><FileText className="h-5 w-5" />Submit Claim</Link>
          </Button>
          <Button size="lg" variant="secondary" className="h-auto py-4 flex-col gap-1 bg-yellow-400 text-yellow-950 hover:bg-yellow-400/90" asChild>
            <Link to="/member/events"><CalendarDays className="h-5 w-5" />View Events</Link>
          </Button>
        </div>
      </div>
    </MemberLayout>
  );
};

export default MemberDashboard;
