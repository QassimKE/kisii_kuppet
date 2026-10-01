import { api } from "./api";
import type { User, Booking, Claim, Event, AuditLog, AdminStats, SharedDocument } from "./types";
import { mockAdminService } from "./mock.service";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export interface MembersPage {
  data:     User[];
  total:    number;
  page:     number;
  pageSize: number;
}

export interface AuditLogsPage {
  data:     AuditLog[];
  total:    number;
  page:     number;
  pageSize: number;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const liveAdminService = {
  // ── Members ────────────────────────────────────────────────────────────────

  getMembers: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return api.get<MembersPage>(`/admin/members${qs ? `?${qs}` : ""}`);
  },

  addMember: (
    data: Omit<User, "id" | "active" | "joinDate"> & { password: string },
  ) => api.post<User>("/admin/members", data),

  updateMember: (
    id: string,
    data: Partial<Omit<User, "id" | "role">> & { role?: string },
  ) => api.patch<User>(`/admin/members/${id}`, data),

  disableMember: (id: string) =>
    api.patch<{ success: boolean }>(`/admin/members/${id}/disable`, {}),

  enableMember: (id: string) =>
    api.patch<{ success: boolean }>(`/admin/members/${id}/enable`, {}),

  deleteMember: (id: string) =>
    api.delete<{ success: boolean }>(`/admin/members/${id}`),

  bulkImportMembers: async (
    file: File,
  ): Promise<{ imported: number; skipped: number }> => {
    const form = new FormData();
    form.append("file", file);
    return api.upload<{ imported: number; skipped: number }>(
      "/admin/members/bulk-import",
      form,
    );
  },

  // ── Bookings ───────────────────────────────────────────────────────────────

  getAllBookings: (status?: Booking["status"]) =>
    api.get<Booking[]>(`/admin/bookings${status ? `?status=${status}` : ""}`),

  updateBookingStatus: (
    id: string,
    status: Booking["status"],
    remarks?: string,
  ) => api.patch<Booking>(`/admin/bookings/${id}/status`, { status, remarks }),

  deleteBooking: (id: string) =>
    api.delete<{ message: string }>(`/admin/bookings/${encodeURIComponent(id)}`),

  // ── Claims ─────────────────────────────────────────────────────────────────

  getAllClaims: (status?: Claim["status"]) =>
    api.get<Claim[]>(`/admin/claims${status ? `?status=${status}` : ""}`),

  updateClaimStatus: (id: string, status: Claim["status"], remarks?: string) =>
    api.patch<Claim>(`/admin/claims/${encodeURIComponent(id)}/status`, { status, remarks }),

  deleteClaim: (id: string) =>
    api.delete<{ message: string }>(`/admin/claims/${encodeURIComponent(id)}`),

  downloadDocument: async (filename: string): Promise<void> => {
    const blob = await api.download(
      `/admin/claims/documents/${encodeURIComponent(filename)}`,
    );
    triggerDownload(blob, filename);
  },

  // ── Shared Documents ───────────────────────────────────────────────────────

  getSharedDocs: () =>
    api.get<SharedDocument[]>("/admin/shared-docs"),

  uploadSharedDoc: async (title: string, file: File): Promise<SharedDocument> => {
    const form = new FormData();
    form.append("title", title);
    form.append("file",  file);
    return api.upload<SharedDocument>("/admin/shared-docs", form);
  },

  deleteSharedDoc: (id: string) =>
    api.delete<{ message: string }>(`/admin/shared-docs/${id}`),

  downloadSharedDoc: async (filename: string): Promise<void> => {
    const blob = await api.download(`/admin/shared-docs/download/${encodeURIComponent(filename)}`);
    triggerDownload(blob, filename);
  },

  // ── Events ─────────────────────────────────────────────────────────────────

  getEvents: () => api.get<Event[]>("/admin/events"),

  createEvent: (data: Omit<Event, "id">) =>
    api.post<Event>("/admin/events", data),

  updateEvent: (id: string, data: Partial<Omit<Event, "id">>) =>
    api.patch<Event>(`/admin/events/${id}`, data),

  deleteEvent: (id: string) =>
    api.delete<{ success: boolean }>(`/admin/events/${id}`),

  // ── Stats ──────────────────────────────────────────────────────────────────

  getAdminStats: () => api.get<AdminStats>("/admin/stats"),

  // ── Reports ────────────────────────────────────────────────────────────────

  exportClaimsReport: async (format: "csv" | "pdf"): Promise<void> => {
    const blob = await api.download(`/admin/reports/claims?format=${format}`);
    triggerDownload(blob, `claims-report.${format}`);
  },

  exportBookingsReport: async (format: "csv" | "pdf"): Promise<void> => {
    const blob = await api.download(`/admin/reports/bookings?format=${format}`);
    triggerDownload(blob, `bookings-report.${format}`);
  },

  // ── Audit Logs ─────────────────────────────────────────────────────────────

  getAuditLogs: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    action?: string;
    from?: string;
    to?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    if (params?.search) q.set("search", params.search);
    if (params?.action) q.set("action", params.action);
    if (params?.from) q.set("from", params.from);
    if (params?.to) q.set("to", params.to);
    const qs = q.toString();
    return api.get<AuditLogsPage>(`/admin/audit-logs${qs ? `?${qs}` : ""}`);
  },
};

export const adminService = USE_MOCK ? mockAdminService : liveAdminService;
