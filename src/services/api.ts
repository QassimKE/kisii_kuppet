const BASE_URL = import.meta.env.VITE_API_URL;

function getToken(): string | null {
  try { return JSON.parse(localStorage.getItem("kuppet_auth") ?? "null")?.token ?? null; }
  catch { return null; }
}

async function request<T>(path: string, options: RequestInit = {}, isJson = true): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(token  ? { Authorization: `Bearer ${token}` }  : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res  = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    // Token invalid or expired — trigger global logout
    // Guard: skip if this IS the logout request to prevent infinite loop
    if (!path.includes("/auth/logout")) {
      const { getLogoutHandler } = await import("@/context/AuthContext");
      getLogoutHandler()?.();
    }
  }

  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  get:    <T>(path: string)                => request<T>(path, { method: "GET" }),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: "POST",  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: "PUT",   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string)               => request<T>(path, { method: "DELETE" }),

  // FormData upload — no Content-Type so browser sets multipart boundary
  upload: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "POST", body: form }, false),

  // Binary download — returns a Blob
  download: async (path: string): Promise<Blob> => {
    const token = getToken();
    const res   = await fetch(`${BASE_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(data.error ?? `Request failed (${res.status})`);
    }
    return res.blob();
  },
};
