import { mockUsers, mockBookings, mockClaims, mockEvents, mockNotifications, mockAuditLogs } from "./mock-data";
import type { User, Booking, Claim, Event, Notification, AuditLog } from "./types";

// Single mutable store — both services read/write here
export const store = {
  users:         [...mockUsers]         as User[],
  bookings:      [...mockBookings]      as Booking[],
  claims:        [...mockClaims]        as Claim[],
  events:        [...mockEvents]        as Event[],
  notifications: [...mockNotifications] as Notification[],
  auditLogs:     [...mockAuditLogs]     as AuditLog[],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

export const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

export const nextId = (prefix: string, list: { id: string }[]) => {
  const nums = list.map((i) => parseInt(i.id.replace(/\D/g, ""), 10)).filter(Boolean);
  return `${prefix}${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
};

export const addLog = (action: string, performedBy: string, target: string, details: string) => {
  store.auditLogs = [
    {
      id: nextId("al", store.auditLogs),
      action, performedBy, target, details,
      timestamp: new Date().toLocaleString("sv").replace("T", " "),
    },
    ...store.auditLogs,
  ];
};

export const pushNotification = (userId: string, message: string, type: Notification["type"]) => {
  store.notifications = [
    {
      id: nextId("n", store.notifications),
      userId, message, type, read: false,
      createdAt: new Date().toISOString().slice(0, 10),
    },
    ...store.notifications,
  ];
};
