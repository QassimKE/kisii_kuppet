import type { Event } from "./types";
import { mockPublicService } from "./mock.service";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const BASE_URL = import.meta.env.VITE_API_URL;

async function get<T>(path: string): Promise<T> {
  const res  = await fetch(`${BASE_URL}${path}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

const livePublicService = {
  getEvents: (status?: "upcoming" | "past") =>
    get<Event[]>(`/public/events${status ? `?status=${status}` : ""}`),
};

export const publicService = USE_MOCK ? mockPublicService : livePublicService;
