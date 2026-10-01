import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import MemberLayout from "@/components/member/MemberLayout";

const DualLayout = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  return user?.role === "admin"
    ? <AdminLayout>{children}</AdminLayout>
    : <MemberLayout>{children}</MemberLayout>;
};

export default DualLayout;
