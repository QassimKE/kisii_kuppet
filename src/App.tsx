import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages
import Index from "@/pages/public/Index";
import About from "@/pages/public/About";
import Events from "@/pages/public/Events";
import Contact from "@/pages/public/Contact";
import Team from "@/pages/public/Team";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Member pages
import MemberDashboard from "@/pages/member/MemberDashboard";
import VanBooking from "@/pages/member/VanBooking";
import Claims from "@/pages/member/Claims";
import Profile from "@/pages/member/Profile";
import Notifications from "@/pages/member/Notifications";
import MemberEvents from "@/pages/member/Events";
import SharedDocs from "@/pages/member/SharedDocs";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Members from "@/pages/admin/Members";
import ClaimsAdmin from "@/pages/admin/ClaimsAdmin";
import BookingsAdmin from "@/pages/admin/BookingsAdmin";
import EventsAdmin from "@/pages/admin/EventsAdmin";
import Reports     from "@/pages/admin/Reports";
import AuditLogs           from "@/pages/admin/AuditLogs";
import AdminNotifications  from "@/pages/admin/AdminNotifications";
import AdminProfile        from "@/pages/admin/AdminProfile";
import Messages            from "@/pages/admin/Messages";
import SharedDocsAdmin    from "@/pages/admin/SharedDocs";

// Shared
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ConfirmProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/team" element={<Team />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Member */}
            <Route
              path="/member-dashboard"
              element={
                <ProtectedRoute role="member">
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/van-booking"
              element={
                <ProtectedRoute >
                  <VanBooking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/claims"
              element={
                <ProtectedRoute >
                  <Claims />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute role="member">
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/events"
              element={
                <ProtectedRoute >
                  <MemberEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/shared-docs"
              element={
                <ProtectedRoute>
                  <SharedDocs />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/members"
              element={
                <ProtectedRoute role="admin">
                  <Members />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/claims"
              element={
                <ProtectedRoute role="admin">
                  <ClaimsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute role="admin">
                  <BookingsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute role="admin">
                  <EventsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute role="admin">
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute role="admin">
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute role="admin">
                  <AdminNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute role="admin">
                  <AdminProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute role="admin">
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/shared-docs"
              element={
                <ProtectedRoute role="admin">
                  <SharedDocsAdmin />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </ConfirmProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
