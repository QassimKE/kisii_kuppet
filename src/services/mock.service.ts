import { store, delay, nextId, addLog, pushNotification } from "./store";
import type { User, Booking, Claim, Event, Notification, SharedDocument, Beneficiary, MemberStats } from "./types";
import type { MembersPage, AuditLogsPage } from "./admin.service";

// ── Auth ─────────────────────────────────────────────────────────────────────

export const mockAuthService = {
  login: async (tscNo: string, _password: string) => {
    await delay();
    const user = store.users.find((u) => u.memberNo === tscNo);
    if (!user) throw new Error("Invalid credentials");
    addLog("LOGIN", `${user.name} ${user.surname}`, "System", `${user.role === "admin" ? "Admin" : "Member"} logged in.`);
    return { token: `mock-token-${user.id}`, user };
  },

  logout: async () => { await delay(100); return { success: true }; },

  checkTsc: async (memberNo: string) => {
    await delay();
    const user = store.users.find((u) => u.memberNo === memberNo);
    return { exists: !!user, hasPassword: !!user, email: user?.email };
  },

  setPassword: async () => { await delay(); return { success: true }; },

  register: async (data: { name: string; memberNo: string; school: string; phone: string; email?: string; subCounty?: string; zone?: string; role?: string; password: string }) => {
    await delay();
    const id = nextId("u", store.users);
    store.users.push({ id, name: data.name, surname: "", gender: "M", email: data.email ?? "", role: (data.role as User["role"]) ?? "member", memberNo: data.memberNo, phone: data.phone, school: data.school, subCounty: data.subCounty ?? "", zone: data.zone ?? "", active: true, joinDate: new Date().toISOString().slice(0, 10) });
    return { success: true };
  },

  sendRegistrationCode:  async () => { await delay(); return { success: true }; },
  sendVerificationCode:  async () => { await delay(); return { success: true, via: "email" as const }; },
  verifyCode:            async () => { await delay(); return { success: true }; },
  resetPassword:         async () => { await delay(); return { success: true }; },
  changePassword:        async () => { await delay(); return { success: true }; },
};

// ── Member ────────────────────────────────────────────────────────────────────

export const mockMemberService = {
  getProfile: async () => {
    await delay();
    return store.users.find((u) => u.role === "member") as User;
  },

  getMembers: async () => {
    await delay();
    return store.users.map(({ id, name, surname, memberNo, school }) => ({ id, name, surname, memberNo, school }));
  },

  updateProfile: async (_id: string, data: Partial<User>) => {
    await delay();
    const u = store.users.find((u) => u.role === "member")!;
    Object.assign(u, data);
    return u;
  },

  getBeneficiaries: async () => { await delay(); return [] as Beneficiary[]; },
  saveBeneficiaries: async (_id: string, b: Beneficiary[]) => { await delay(); return b; },

  getMemberStats: async () => {
    await delay();
    const memberId = store.users.find((u) => u.role === "member")?.id ?? "";
    return {
      totalBookings:   store.bookings.filter((b) => b.memberId === memberId).length,
      pendingBookings: store.bookings.filter((b) => b.memberId === memberId && b.status === "pending").length,
      totalClaims:     store.claims.filter((c) => c.memberId === memberId).length,
      pendingClaims:   store.claims.filter((c) => c.memberId === memberId && c.status === "pending").length,
    } as MemberStats;
  },

  getBookings: async (memberId: string) => {
    await delay();
    return store.bookings.filter((b) => b.memberId === memberId);
  },

  getBookedDates: async () => {
    await delay();
    return store.bookings.filter((b) => b.status === "approved").map((b) => b.date);
  },

  submitBooking: async (data: Pick<Booking, "date" | "destination" | "purpose" | "passengers">) => {
    await delay();
    const member = store.users.find((u) => u.role === "member")!;
    const booking: Booking = { id: nextId("BK-", store.bookings), memberId: member.id, memberName: `${member.name} ${member.surname}`, ...data, status: "pending", createdAt: new Date().toISOString().slice(0, 10) };
    store.bookings.unshift(booking);
    pushNotification("u1", `New van booking request: ${booking.id} by ${booking.memberName} to ${booking.destination}.`, "booking");
    return booking;
  },

  getClaims: async (memberId: string) => {
    await delay();
    return store.claims.filter((c) => c.memberId === memberId);
  },

  submitClaim: async (data: { claimant: string; relationship: string; category: string; details: string; claimantTsc?: string }) => {
    await delay();
    const member = store.users.find((u) => u.role === "member")!;
    const claim: Claim = { id: nextId("CLM-", store.claims), memberId: member.id, memberName: `${member.name} ${member.surname}`, type: data.category, claimant: data.claimant, relationship: data.relationship, details: data.details, amount: "KES 50,000", status: "pending", documents: [], createdAt: new Date().toISOString().slice(0, 10) };
    store.claims.unshift(claim);
    pushNotification("u1", `New claim submitted: ${claim.id} by ${claim.memberName} — ${claim.amount}.`, "claim");
    return claim;
  },

  getEvents: async () => { await delay(); return store.events; },

  getNotifications: async (userId: string) => {
    await delay();
    return store.notifications.filter((n) => n.userId === userId);
  },

  markNotificationRead: async (id: string) => {
    await delay();
    const n = store.notifications.find((n) => n.id === id);
    if (n) n.read = true;
    return { success: true };
  },

  markAllRead: async (userId: string) => {
    await delay();
    store.notifications.filter((n) => n.userId === userId).forEach((n) => (n.read = true));
    return { success: true };
  },

  getSharedDocs: async () => { await delay(); return [] as SharedDocument[]; },

  downloadSharedDoc: async (filename: string) => {
    await delay();
    alert(`Mock: download "${filename}"`);
  },

  changePassword: async () => { await delay(); return { success: true }; },
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const mockAdminService = {
  getMembers: async (params?: { page?: number; pageSize?: number; search?: string }): Promise<MembersPage> => {
    await delay();
    let data = [...store.users];
    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter((u) => `${u.name} ${u.surname} ${u.memberNo} ${u.school}`.toLowerCase().includes(q));
    }
    const page = params?.page ?? 1, pageSize = params?.pageSize ?? 10;
    return { data: data.slice((page - 1) * pageSize, page * pageSize), total: data.length, page, pageSize };
  },

  addMember: async (data: Omit<User, "id" | "active" | "joinDate"> & { password: string }) => {
    await delay();
    const user: User = { id: nextId("u", store.users), active: true, joinDate: new Date().toISOString().slice(0, 10), ...data };
    store.users.push(user);
    addLog("MEMBER_ADDED", "Admin User", user.memberNo, `New member ${user.name} ${user.surname} added.`);
    return user;
  },

  updateMember: async (id: string, data: Partial<User>) => {
    await delay();
    const u = store.users.find((u) => u.id === id)!;
    Object.assign(u, data);
    addLog("MEMBER_UPDATED", "Admin User", u.memberNo, `Member ${u.name} ${u.surname} updated.`);
    return u;
  },

  disableMember: async (id: string) => {
    await delay();
    const u = store.users.find((u) => u.id === id)!;
    u.active = false;
    addLog("MEMBER_DISABLED", "Admin User", u.memberNo, `Member ${u.name} ${u.surname} disabled.`);
    return { success: true };
  },

  enableMember: async (id: string) => {
    await delay();
    const u = store.users.find((u) => u.id === id)!;
    u.active = true;
    addLog("MEMBER_ENABLED", "Admin User", u.memberNo, `Member ${u.name} ${u.surname} enabled.`);
    return { success: true };
  },

  deleteMember: async (id: string) => {
    await delay();
    const idx = store.users.findIndex((u) => u.id === id);
    if (idx !== -1) store.users.splice(idx, 1);
    return { success: true };
  },

  bulkImportMembers: async () => { await delay(); return { imported: 0, skipped: 0 }; },

  getAllBookings: async (status?: Booking["status"]) => {
    await delay();
    return status ? store.bookings.filter((b) => b.status === status) : store.bookings;
  },

  updateBookingStatus: async (id: string, status: Booking["status"], remarks?: string) => {
    await delay();
    const b = store.bookings.find((b) => b.id === id)!;
    b.status = status; if (remarks) b.remarks = remarks;
    addLog(`BOOKING_${status.toUpperCase()}`, "Admin User", id, `Booking ${id} ${status}.${remarks ? ` Reason: ${remarks}` : ""}`);
    pushNotification(b.memberId, `Your booking ${id} has been ${status}.${remarks ? ` Reason: ${remarks}` : ""}`, "booking");
    return b;
  },

  deleteBooking: async (id: string) => {
    await delay();
    const idx = store.bookings.findIndex((b) => b.id === id);
    if (idx !== -1) store.bookings.splice(idx, 1);
    return { message: "Deleted" };
  },

  getAllClaims: async (status?: Claim["status"]) => {
    await delay();
    return status ? store.claims.filter((c) => c.status === status) : store.claims;
  },

  updateClaimStatus: async (id: string, status: Claim["status"], remarks?: string) => {
    await delay();
    const c = store.claims.find((c) => c.id === id)!;
    c.status = status; if (remarks) c.remarks = remarks;
    addLog(`CLAIM_${status.toUpperCase()}`, "Admin User", id, `Claim ${id} ${status}.${remarks ? ` Reason: ${remarks}` : ""}`);
    pushNotification(c.memberId, `Your claim ${id} has been ${status}.${remarks ? ` Reason: ${remarks}` : ""}`, "claim");
    return c;
  },

  deleteClaim: async (id: string) => {
    await delay();
    const idx = store.claims.findIndex((c) => c.id === id);
    if (idx !== -1) store.claims.splice(idx, 1);
    return { message: "Deleted" };
  },

  downloadDocument: async (filename: string) => { await delay(); alert(`Mock: download "${filename}"`); },

  getSharedDocs: async () => { await delay(); return [] as SharedDocument[]; },
  uploadSharedDoc: async (title: string) => { await delay(); return { id: nextId("sd", []), title, filename: title, uploadedAt: new Date().toISOString().slice(0, 10) } as SharedDocument; },
  deleteSharedDoc: async () => { await delay(); return { message: "Deleted" }; },
  downloadSharedDoc: async (filename: string) => { await delay(); alert(`Mock: download "${filename}"`); },

  getEvents: async () => { await delay(); return store.events; },

  createEvent: async (data: Omit<Event, "id">) => {
    await delay();
    const event: Event = { id: nextId("ev", store.events), ...data };
    store.events.unshift(event);
    return event;
  },

  updateEvent: async (id: string, data: Partial<Omit<Event, "id">>) => {
    await delay();
    const e = store.events.find((e) => e.id === id)!;
    Object.assign(e, data);
    return e;
  },

  deleteEvent: async (id: string) => {
    await delay();
    const idx = store.events.findIndex((e) => e.id === id);
    if (idx !== -1) store.events.splice(idx, 1);
    return { success: true };
  },

  getAdminStats: async () => {
    await delay();
    return {
      totalMembers:    store.users.filter((u) => u.role === "member").length,
      activeMembers:   store.users.filter((u) => u.role === "member" && u.active).length,
      pendingClaims:   store.claims.filter((c) => c.status === "pending").length,
      pendingBookings: store.bookings.filter((b) => b.status === "pending").length,
      totalClaims:     store.claims.length,
      totalBookings:   store.bookings.length,
    };
  },

  exportClaimsReport:   async () => { await delay(); alert("Mock: claims report export"); },
  exportBookingsReport: async () => { await delay(); alert("Mock: bookings report export"); },

  getAuditLogs: async (params?: { page?: number; pageSize?: number; search?: string; action?: string; from?: string; to?: string }): Promise<AuditLogsPage> => {
    await delay();
    let data = [...store.auditLogs];
    if (params?.search) { const q = params.search.toLowerCase(); data = data.filter((l) => `${l.action} ${l.performedBy} ${l.target} ${l.details}`.toLowerCase().includes(q)); }
    if (params?.action) data = data.filter((l) => l.action === params.action);
    if (params?.from)   data = data.filter((l) => l.timestamp >= params.from!);
    if (params?.to)     data = data.filter((l) => l.timestamp <= params.to!);
    const page = params?.page ?? 1, pageSize = params?.pageSize ?? 10;
    return { data: data.slice((page - 1) * pageSize, page * pageSize), total: data.length, page, pageSize };
  },
};

// ── Public ────────────────────────────────────────────────────────────────────

export const mockPublicService = {
  getEvents: async (status?: "upcoming" | "past") => {
    await delay();
    return status ? store.events.filter((e) => e.status === status) : store.events;
  },
};
