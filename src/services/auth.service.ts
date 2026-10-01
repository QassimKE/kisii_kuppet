import { api } from "./api";
import type { User } from "./types";
import { mockAuthService } from "./mock.service";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const liveAuthService = {
  login: (tscNo: string, password: string) =>
    api.post<{ token: string; user: User }>("/auth/login", { tscNo, password }),

  logout: () =>
    api.post<{ success: boolean }>("/auth/logout", {}),

  checkTsc: (memberNo: string) =>
    api.post<{ exists: boolean; hasPassword: boolean; email?: string }>("/auth/check-tsc", { memberNo }),

  setPassword: (memberNo: string, password: string) =>
    api.post<{ success: boolean }>("/auth/set-password", { memberNo, password }),

  register: (data: {
    name: string; memberNo: string; school: string; phone: string;
    email?: string; subCounty?: string; zone?: string; role?: string; password: string;
  }) => api.post<{ success: boolean }>("/auth/register", data),

  sendRegistrationCode: (email: string) =>
    api.post<{ success: boolean }>("/auth/send-registration-code", { email }),

  sendVerificationCode: (contact: { email: string } | { phone: string }) =>
    api.post<{ success: boolean; via: "email" | "sms" }>("/auth/send-verification-code", contact),

  verifyCode: (contact: { email: string } | { phone: string }, code: string) =>
    api.post<{ success: boolean }>("/auth/verify-code", { ...contact, code }),

  resetPassword: (contact: { email: string } | { phone: string }, newPassword: string) =>
    api.post<{ success: boolean }>("/auth/reset-password", { ...contact, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ success: boolean }>("/auth/change-password", { currentPassword, newPassword }),
};

export const authService = USE_MOCK ? mockAuthService : liveAuthService;
