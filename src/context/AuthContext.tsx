import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authService } from "@/services/auth.service";
import { api } from "@/services/api";
import type { User } from "@/services/types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "kuppet_auth";

// Global logout callback — called by api.ts on any 401
let _logout: (() => void) | null = null;
export function getLogoutHandler() { return _logout; }

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const logout = () => {
    // Clear state first so any in-flight 401s don't re-trigger logout
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    authService.logout().catch(() => {}); // fire-and-forget, after state is cleared
  };

  // Keep ref always current so api.ts always calls the latest closure
  useEffect(() => { _logout = logout; });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) { setReady(true); return; }

    const parsed = JSON.parse(stored);

    if (USE_MOCK) {
      setUser(parsed.user);
      setToken(parsed.token);
      setReady(true);
      return;
    }

    // Validate the stored token against the current backend before trusting it
    api.get<User>("/members/me")
      .then((freshUser) => {
        setUser(freshUser);
        setToken(parsed.token);
        // Keep stored user fresh
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: parsed.token, user: freshUser }));
      })
      .catch(() => {
        // Token invalid or wrong backend — clear everything
        localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setReady(true));
  }, []);

  const login = async (username: string, password: string) => {
    const result = await authService.login(username, password);
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  };

  // Don't render children until the token check resolves — prevents flash of
  // authenticated UI before the 401 clears the session
  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
