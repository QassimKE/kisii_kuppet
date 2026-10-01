import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import StatCard from "@/components/public/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bus, FileText, Users, CheckCircle, XCircle, Clock, CalendarDays } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { adminService } from "@/services/admin.service";
import type { AdminStats, Booking, Claim } from "@/services/types";

const statusIcons: Record<string, React.ReactNode> = {
  approved: <CheckCircle className="h-4 w-4 text-success" />,
  pending:  <Clock className="h-4 w-4 text-warning" />,
  rejected: <XCircle className="h-4 w-4 text-destructive" />,
};

const AdminDashboard = () => {
  const [stats, setStats]       = useState<AdminStats | null>(null);
  const [claims, setClaims]     = useState<Claim[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    adminService.getAdminStats().then(setStats);
    adminService.getAllClaims().then((c) => setClaims(c.slice(0, 5)));
    adminService.getAllBookings().then((b) => setBookings(b.slice(0, 5)));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Bus}         title="Total Bookings"    value={stats?.totalBookingsYear  ?? "—"} subtitle="This year" />
          <StatCard icon={FileText}    title="Claims This Month" value={stats?.claimsThisMonth    ?? "—"} subtitle="Current month" />
          <StatCard icon={CheckCircle} title="Approval Rate"     value={stats ? `${stats.approvalRate}%` : "—"} subtitle="Claims approved" />
          <StatCard icon={Users}       title="Active Members"    value={stats?.activeMembers      ?? "—"} subtitle="Registered" />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="shadow-card lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Claims Overview</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stats?.monthlyClaimsChart ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="submitted" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="approved"  stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base">Claim Status</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={stats?.claimStatusBreakdown ?? []} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {(stats?.claimStatusBreakdown ?? []).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                {(stats?.claimStatusBreakdown ?? []).map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-muted-foreground">{s.name} ({s.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Chart */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Monthly Van Bookings</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.monthlyBookingsChart ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Tabs defaultValue="claims">
          <TabsList>
            <TabsTrigger value="claims">Recent Claims</TabsTrigger>
            <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="claims">
            <Card className="shadow-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Member</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claims.map((c) => (
                        <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{c.id}</td>
                          <td className="px-4 py-3 text-foreground">{c.memberName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{c.createdAt}</td>
                          <td className="px-4 py-3 text-foreground">{c.amount}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5">
                              {statusIcons[c.status]}
                              <span className="capitalize text-foreground">{c.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="shadow-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Member</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Destination</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{b.id}</td>
                          <td className="px-4 py-3 text-foreground">{b.memberName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{b.date}</td>
                          <td className="px-4 py-3 text-foreground">{b.destination}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5">
                              {statusIcons[b.status]}
                              <span className="capitalize text-foreground">{b.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Quick Actions — Member Area */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">My Member Area</h2>
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

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
