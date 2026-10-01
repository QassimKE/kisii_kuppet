# Kisii KUPPET Welfare — Frontend Development Plan
> Stack: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Query + React Router v6  
> Approach: Mock data + simulated API calls (SPI layer) — no backend required for frontend milestones

---

## Current System Audit

### ✅ Built & Complete
| Area | Status | Notes |
|---|---|---|
| Project scaffold | ✅ Done | Vite + React + TS + shadcn/ui + Tailwind |
| Folder structure | ✅ Done | pages/public, pages/auth, pages/member, pages/admin, components/public, components/member, components/admin, services/ |
| Services layer | ✅ Done | `services/types.ts`, `services/mock-data.ts`, `services/store.ts`, `services/member.service.ts`, `services/admin.service.ts` |
| Auth context | ✅ Done | `context/AuthContext.tsx` — useAuth(), login/logout, localStorage persistence |
| ProtectedRoute | ✅ Done | Role-aware guard, redirects unauthenticated users |
| Routing (App.tsx) | ✅ Done | All routes registered with guards — public, member, admin |
| PublicLayout + Navbar + Footer | ✅ Done | `components/public/` — responsive, mobile menu |
| StatCard component | ✅ Done | `components/public/StatCard.tsx` |
| MemberLayout | ✅ Done | `components/member/MemberLayout.tsx` — sticky sidebar, topbar, notification bell, logout |
| Home page | ✅ Done | `pages/public/Index.tsx` — hero, 4 feature cards, CTA |
| About page | ✅ Done | `pages/public/About.tsx` — mission, vision, values |
| Public Events page | ✅ Done | `pages/public/Events.tsx` — static cards with badges |
| Contact page | ✅ Done | `pages/public/Contact.tsx` — form + contact info |
| Login page | ✅ Done | `pages/auth/Login.tsx` — CAPTCHA, demo credentials panel, AuthContext wired |
| Register page | ✅ Done | `pages/auth/Register.tsx` — full form, memberService.register() |
| Member Dashboard | ✅ Done | `pages/member/MemberDashboard.tsx` — live stats, booking chart, recent claims, quick actions |
| Van Booking | ✅ Done | `pages/member/VanBooking.tsx` — SPI wired, reactive history, status filter, remarks display |
| Claims | ✅ Done | `pages/member/Claims.tsx` — SPI wired, 5MB validation, reactive history, status filter, remarks |
| Profile | ✅ Done | `pages/member/Profile.tsx` — membership details, edit info, change password |
| Notifications | ✅ Done | `pages/member/Notifications.tsx` — filter tabs, mark read, mark all read |
| Member Events | ✅ Done | `pages/member/Events.tsx` — SPI wired, upcoming/past filter, MemberLayout |
| Admin Dashboard | ✅ Done | `pages/admin/AdminDashboard.tsx` — live stats, 3 charts, recent claims/bookings tables |
| UI component library | ✅ Done | Full shadcn/ui set in `components/ui/` |
| Recharts integration | ✅ Done | Bar, Line, Pie charts wired with live mock data |

### ❌ Remaining / In Progress

#### Admin-Side (Milestone 2)
| Area | Status |
|---|---|
| AdminLayout | ✅ Done — `components/admin/AdminLayout.tsx` |
| Members page | ✅ Done — `pages/admin/Members.tsx` |
| ClaimsAdmin page | ✅ Done — `pages/admin/ClaimsAdmin.tsx` |
| BookingsAdmin page | ✅ Done — `pages/admin/BookingsAdmin.tsx` |
| EventsAdmin page | ✅ Done — `pages/admin/EventsAdmin.tsx` |
| AdminDashboard wrapped in AdminLayout | ✅ Done |
| ConfirmDialog component | ✅ Done — `components/ConfirmDialog.tsx` + `context/ConfirmContext.tsx` |

#### Milestone 3
| Area | Status |
|---|---|
| Reports page | ❌ Missing — `pages/admin/Reports.tsx` |
| Audit Logs page | ❌ Missing — `pages/admin/AuditLogs.tsx` |
| Notification auto-generation on admin actions | ✅ Done — wired in admin.service.ts |
| Notification bell in AdminLayout | ✅ Done — wired in AdminLayout |

---

## Current File Structure

```
src/
├── components/
│   ├── ui/                         ✅ Full shadcn/ui set
│   ├── public/                     ✅ Navbar, Footer, PublicLayout, NavLink, StatCard
│   ├── member/                     ✅ MemberLayout (sticky sidebar, topbar, notification bell)
│   ├── admin/                      ✅ AdminLayout (sticky sidebar, notification bell, all nav links)
│   └── ConfirmDialog.tsx           ✅ Reusable confirm dialog — variant support (default/destructive)
├── context/
│   ├── AuthContext.tsx             ✅ useAuth(), login/logout, localStorage
│   └── ConfirmContext.tsx          ✅ useConfirm() hook — promise-based global confirm dialog
├── services/
│   ├── types.ts                    ✅ All shared interfaces
│   ├── mock-data.ts                ✅ Seed data for all entities
│   ├── store.ts                    ✅ Shared in-memory mutable store
│   ├── member.service.ts           ✅ Auth, profile, stats, bookings, claims, events, notifications
│   └── admin.service.ts            ✅ Members CRUD, bookings/claims approval, events CRUD, stats, reports, audit logs
├── pages/
│   ├── public/                     ✅ Index, About, Events, Contact
│   ├── auth/                       ✅ Login (demo credentials), Register
│   ├── member/                     ✅ MemberDashboard, VanBooking, Claims, Profile, Notifications, Events
│   ├── admin/                      ⚠️ AdminDashboard, Members, ClaimsAdmin, BookingsAdmin, EventsAdmin ✅ | Reports, AuditLogs ❌
│   └── NotFound.tsx                ✅
├── hooks/                          ✅ use-mobile, use-toast
├── lib/
│   └── utils.ts                    ✅
├── App.tsx                         ✅ All routes with ProtectedRoute guards
└── main.tsx                        ✅
```

---

## Milestone 1 — Foundation & Core Infrastructure ✅ COMPLETE
**Budget: 12,000**

### Phase 1.1 — Fix & Foundation ✅
- [x] Fix `App.tsx` typo: `<Toaster />~` → `<Toaster />`
- [x] Fix `Index.tsx`: all 4 feature cards (Events, Member Portal, Van Booking, Claims)
- [x] Create `services/mock-data.ts` — seed data for all entities
- [x] Create `services/store.ts` — shared in-memory mutable store
- [x] Create `services/member.service.ts` — all member SPI functions
- [x] Create `services/admin.service.ts` — all admin SPI functions
- [x] Create `services/types.ts` — all shared TypeScript interfaces
- [x] Create `context/AuthContext.tsx` — useAuth(), login/logout, localStorage persistence
- [x] Create `components/ProtectedRoute.tsx` — role-aware route guard

### Phase 1.2 — Member Layout & Navigation ✅
- [x] `components/member/MemberLayout.tsx` — sticky sidebar (fixed, independent scroll), topbar with greeting, notification bell with unread badge, logout
  - Dashboard, Van Booking, Claims, Events, Profile, Notifications, Logout

### Phase 1.3 — Missing Member Pages ✅
- [x] `pages/auth/Register.tsx` — full registration form, memberService.register(), redirects to login
- [x] `pages/member/Profile.tsx` — membership details card, edit info form, change password form
- [x] `pages/member/Notifications.tsx` — filter tabs (All/Unread/Claims/Bookings/Events), mark read, mark all read
- [x] `pages/member/Events.tsx` — SPI wired, upcoming/past/all filter tabs, MemberLayout

### Phase 1.4 — Upgrade Existing Member Pages ✅
- [x] `MemberDashboard.tsx` — MemberLayout, live stats from memberService.getMemberStats(), booking chart, recent claims, claims breakdown (pending/approved/rejected), quick actions
- [x] `VanBooking.tsx` — MemberLayout, memberService.submitBooking() wired, reactive history, status filter, remarks on rejected bookings
- [x] `Claims.tsx` — MemberLayout, memberService.submitClaim() wired, 5MB file validation, reactive history, status filter, remarks display, document count

### Phase 1.5 — Route Updates ✅
- [x] `/register` — public
- [x] `/profile` — ProtectedRoute (member)
- [x] `/notifications` — ProtectedRoute
- [x] `/member/events` — ProtectedRoute (member)
- [x] All member routes wrapped with `<ProtectedRoute role="member">`
- [x] All admin routes wrapped with `<ProtectedRoute role="admin">`

### Phase 1.6 — Login Demo Credentials ✅
- [x] Demo credentials panel on Login page — clickable Admin and Member tiles that auto-fill the form

---

## Milestone 2 — Core Functional Modules ⏳ IN PROGRESS
**Budget: 14,000**

### Phase 2.1 — Admin Layout ✅
- [x] Create `components/admin/AdminLayout.tsx` — sticky sidebar with links:
  - Dashboard → `/admin-dashboard`
  - Members → `/admin/members`
  - Claims → `/admin/claims`
  - Bookings → `/admin/bookings`
  - Events → `/admin/events`
  - Reports → `/admin/reports`
  - Audit Logs → `/admin/audit-logs`
  - Logout
- [x] Wrap `AdminDashboard.tsx` in `AdminLayout`
- [x] Notification bell in topbar with live unread count

### Phase 2.2 — Admin Pages ✅

**`pages/admin/Members.tsx`** ✅
- [x] Searchable table across name, member no, school, phone, email
- [x] Add Member dialog — all fields, calls `adminService.addMember()`
- [x] Edit Member dialog — pre-filled, calls `adminService.updateMember()`
- [x] Disable/Enable toggle with `useConfirm()` — calls `adminService.disableMember()` / `adminService.enableMember()`
- [x] Member count stat at top

**`pages/admin/ClaimsAdmin.tsx`** ✅
- [x] Claims table: ID, Member, Type, Claimant, Amount, Date, Docs, Status
- [x] Filter pills by status: All / Pending / Approved / Rejected with live counts
- [x] Approve ✓ / Reject ✗ buttons on pending rows only
- [x] Remarks dialog — required on rejection, optional on approval
- [x] Document download links per row — calls `adminService.downloadDocument()`
- [x] Claim detail drawer (Sheet) — full claim info + documents list

**`pages/admin/BookingsAdmin.tsx`** ✅
- [x] Bookings table: ID, Member, Date, Destination, Purpose, Passengers, Status
- [x] Filter pills by status with live counts
- [x] Calendar view tab — approved bookings grouped by date
- [x] Approve/Reject with remarks dialog (required on rejection)
- [x] Booking detail drawer (Sheet)

**`pages/admin/EventsAdmin.tsx`** ✅
- [x] Events cards grouped into Upcoming / Past sections
- [x] Create Event dialog — Title, Date, Time, Location, Description, Status
- [x] Edit Event dialog — pre-filled
- [x] Delete with `useConfirm()` destructive variant
- [x] Calls `adminService.createEvent()`, `adminService.updateEvent()`, `adminService.deleteEvent()`
- [x] Creating event auto-pushes notifications to all members

### Phase 2.4 — Global Confirm Dialog ✅
- [x] `components/ConfirmDialog.tsx` — reusable dialog, supports default/destructive variants
- [x] `context/ConfirmContext.tsx` — `useConfirm()` hook returning a Promise, resolved on confirm / rejected on cancel
- [x] `ConfirmProvider` wired in `App.tsx` wrapping all routes
- [x] All inline `AlertDialog` confirm blocks replaced with `useConfirm()` across admin pages

### Phase 2.3 — Admin Dashboard Upgrade ✅
- [x] Wire all stats from `adminService.getAdminStats()`
- [x] Monthly claims line chart (submitted vs approved)
- [x] Claim status pie chart (Pending / Approved / Rejected)
- [x] Monthly bookings bar chart
- [x] Recent claims and bookings tables from live mock data

---

## Milestone 3 — Dashboards, Reports & System Intelligence ❌ NOT STARTED
**Budget: 9,000**

### Phase 3.1 — Notifications System ✅ Complete
- [x] `pages/member/Notifications.tsx` — full notification page built
- [x] Auto-generate notifications in admin.service.ts when claim/booking status changes or event created
- [x] Notification bell in MemberLayout with live unread count
- [x] Notification bell in AdminLayout with live unread count

### Phase 3.2 — Reports Export ✅
- [x] `pages/admin/Reports.tsx`
  - Claims tab: date range filter, status filter, preview table
  - Bookings tab: date range filter, status filter, preview table
  - Export CSV / Export PDF — calls `adminService.exportClaimsReport()` / `exportBookingsReport()`
  - Summary stats: total, approved, pending, rejected, approval rate, total approved amount

### Phase 3.3 — Audit Logs ✅
- [x] `pages/admin/AuditLogs.tsx`
  - Filterable table: Timestamp, Action, Performed By, Target, Details
  - Filter by action type (dynamic dropdown from live data), date range, free-text search
  - Action badges with colour-coded variants per action type
  - Sorted newest-first

### Phase 3.4 — Final Dashboard Polish ✅
- [x] `AdminDashboard.tsx` — wrapped in AdminLayout, sidebar provides full navigation to all admin sections

---

## Service Layer Reference

### `services/member.service.ts`
```
login(), register(), changePassword()
getProfile(), updateProfile()
getMemberStats(memberId)
getBookings(memberId), submitBooking()
getClaims(memberId), submitClaim()
getEvents()
getNotifications(userId), markNotificationRead(), markAllRead()
```

### `services/admin.service.ts`
```
getMembers(), addMember(), updateMember(), disableMember(), enableMember()
getAllBookings(), updateBookingStatus()
getAllClaims(), updateClaimStatus(), downloadDocument()
getEvents(), createEvent(), updateEvent(), deleteEvent()
getAdminStats()
exportClaimsReport(), exportBookingsReport()
getAuditLogs()
```

---

## Complete Route Map

```tsx
// Public
<Route path="/"              → Index />
<Route path="/about"         → About />
<Route path="/events"        → Events (public) />
<Route path="/contact"       → Contact />
<Route path="/login"         → Login (demo credentials panel) />
<Route path="/register"      → Register />

// Member (ProtectedRoute role="member")
<Route path="/member-dashboard" → MemberDashboard />
<Route path="/van-booking"      → VanBooking />
<Route path="/claims"           → Claims />
<Route path="/profile"          → Profile />
<Route path="/member/events"    → MemberEvents />
<Route path="/notifications"    → Notifications />

// Admin (ProtectedRoute role="admin")
<Route path="/admin-dashboard"  → AdminDashboard />
<Route path="/admin/members"    → Members ✅ />
<Route path="/admin/claims"     → ClaimsAdmin ✅ />
<Route path="/admin/bookings"   → BookingsAdmin ✅ />
<Route path="/admin/events"     → EventsAdmin ✅ />
<Route path="/admin/reports"    → Reports ✅ />
<Route path="/admin/audit-logs" → AuditLogs ✅ />
```

---

## Page Inventory

### Public Pages (6) — ✅ All Complete
| Page | Route | Status |
|---|---|---|
| Home | `/` | ✅ Done |
| About | `/about` | ✅ Done |
| Events | `/events` | ✅ Done |
| Contact | `/contact` | ✅ Done |
| Login | `/login` | ✅ Done — demo credentials panel |
| Register | `/register` | ✅ Done |

### Member Portal Pages (7) — ✅ All Complete
| Page | Route | Status |
|---|---|---|
| Member Dashboard | `/member-dashboard` | ✅ Done — live data, charts |
| Van Booking | `/van-booking` | ✅ Done — SPI wired, filter, remarks |
| Claims | `/claims` | ✅ Done — SPI wired, 5MB validation, filter, remarks |
| Profile | `/profile` | ✅ Done — edit info, change password |
| Events | `/member/events` | ✅ Done — SPI wired, filter tabs |
| Notifications | `/notifications` | ✅ Done — filter, mark read |
| MemberLayout | — | ✅ Done — sticky sidebar, independent scroll |

### Admin Panel Pages (8) — ⚠️ Partial
| Page | Route | Status |
|---|---|---|
| Admin Dashboard | `/admin-dashboard` | ✅ Done — live stats + charts |
| Members | `/admin/members` | ✅ Done — searchable table, add/edit/disable |
| Claims Admin | `/admin/claims` | ✅ Done — filter, approve/reject, drawer, doc download |
| Bookings Admin | `/admin/bookings` | ✅ Done — filter, approve/reject, calendar view, drawer |
| Events Admin | `/admin/events` | ✅ Done — CRUD dialogs, auto-notifications |
| Reports | `/admin/reports` | ✅ Done — date range + status filter, summary stats, CSV/PDF export |
| Audit Logs | `/admin/audit-logs` | ✅ Done — search, action type filter, date range filter |
| AdminLayout | — | ✅ Done — sticky sidebar, notification bell |
| ConfirmDialog | — | ✅ Done — global useConfirm() hook |

**Total pages: 23 (6 public + 7 member + 10 admin)**

---

## Budget Alignment

| Milestone | Scope | Budget | Status |
|---|---|---|---|
| M1 | Auth, services layer, MemberLayout, all member pages, AdminDashboard data | 12,000 | ✅ Complete |
| M2 | AdminLayout, Members, ClaimsAdmin, BookingsAdmin, EventsAdmin, ConfirmDialog | 14,000 | ✅ Complete |
| M3 | Reports export, AuditLogs | 9,000 | ✅ Complete |
| **Total** | | **35,000** | |

---

*Last updated: 2026 — All 3 milestones ✅ complete.*
