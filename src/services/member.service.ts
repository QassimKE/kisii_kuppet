import { api } from "./api";
import type { User, Booking, Claim, Event, Notification, MemberStats, Beneficiary, SharedDocument } from "./types";
import { mockMemberService } from "./mock.service";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const liveMemberService = {

  // ── Profile ────────────────────────────────────────────────────────────────

  getProfile: () =>
    api.get<User>("/members/me"),

  getMembers: () =>
    api.get<Pick<User, "id" | "name" | "surname" | "memberNo" | "school">[]>("/members"),

  updateProfile: (_id: string, data: Partial<Pick<User, "name" | "surname" | "phone" | "school" | "email" | "subCounty" | "zone" | "gender">>) =>
    api.patch<User>("/members/me", data),

  getBeneficiaries: (_id: string) =>
    api.get<Beneficiary[]>("/members/me/beneficiaries"),

  saveBeneficiaries: (_id: string, beneficiaries: Beneficiary[]) =>
    api.put<Beneficiary[]>("/members/me/beneficiaries", beneficiaries),

  // ── Stats ──────────────────────────────────────────────────────────────────

  getMemberStats: (_memberId: string) =>
    api.get<MemberStats>("/members/me/stats"),

  // ── Bookings ───────────────────────────────────────────────────────────────

  getBookings: (_memberId: string) =>
    api.get<Booking[]>("/bookings"),

  getBookedDates: () =>
    api.get<string[]>("/bookings/booked-dates"),

  submitBooking: (data: Pick<Booking, "date" | "destination" | "purpose" | "passengers">, files?: { passengersList?: File; paymentProof?: File }) => {
    const form = new FormData();
    form.append("date",        data.date);
    form.append("destination", data.destination);
    form.append("purpose",     data.purpose);
    form.append("passengers",  String(data.passengers));
    if (files?.passengersList) form.append("passengersList", files.passengersList);
    if (files?.paymentProof)   form.append("paymentProof",   files.paymentProof);
    return api.upload<Booking>("/bookings", form);
  },

  // ── Claims ─────────────────────────────────────────────────────────────────

  getClaims: (_memberId: string) =>
    api.get<Claim[]>("/claims"),

  submitClaim: (data: { claimant: string; relationship: string; category: string; details: string; claimantTsc?: string }, files?: { burialPermit?: File; payslip?: File }) => {
    const form = new FormData();
    form.append("claimant",     data.claimant);
    form.append("relationship", data.relationship);
    form.append("category",     data.category);
    form.append("details",      data.details);
    if (data.claimantTsc) form.append("claimantTsc", data.claimantTsc);
    if (files?.burialPermit) form.append("burialPermit", files.burialPermit);
    if (files?.payslip)      form.append("payslip",      files.payslip);
    return api.upload<Claim>("/claims", form);
  },

  // ── Events ─────────────────────────────────────────────────────────────────

  getEvents: () =>
    api.get<Event[]>("/events"),

  // ── Notifications ──────────────────────────────────────────────────────────

  getNotifications: (_userId: string) =>
    api.get<Notification[]>("/notifications"),

  markNotificationRead: (id: string) =>
    api.patch<{ success: boolean }>(`/notifications/${id}/read`, {}),

  markAllRead: (_userId: string) =>
    api.patch<{ success: boolean }>("/notifications/read-all", {}),

  // ── Shared Documents ───────────────────────────────────────────────────────

  getSharedDocs: () =>
    api.get<SharedDocument[]>("/shared-docs"),

  downloadSharedDoc: async (filename: string): Promise<void> => {
    const blob = await api.download(`/shared-docs/download/${encodeURIComponent(filename)}`);
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },

  // ── Change password ────────────────────────────────────────────────────────

  changePassword: (_id: string, currentPassword: string, newPassword: string) =>
    api.post<{ success: boolean }>("/auth/change-password", { currentPassword, newPassword }),
};

export const memberService = USE_MOCK ? mockMemberService : liveMemberService;
