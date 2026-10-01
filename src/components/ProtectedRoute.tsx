import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/api";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  role?: Role;
}

const ProtectedRoute = ({ children, role }: Props) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user?.role !== role) return <Navigate to={user?.role === "admin" ? "/admin-dashboard" : "/member-dashboard"} replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
