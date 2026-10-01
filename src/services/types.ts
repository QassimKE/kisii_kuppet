export type Role   = "admin" | "member";
export type Status = "pending" | "approved" | "rejected";

export type SubCounty =
  | "Ithanga-Kakuzi" | "Gatanga" | "Kandara" | "Kisii South"
  | "Kigumo" | "Kisii East" | "Kahuro" | "Mathioya" | "Kangema";

export type BeneficiaryRelationship =
  | "Legal Spouse"
  | "Biological Child"
  | "Biological Father"
  | "Biological Mother"
  | "Biological Father-in-law"
  | "Biological Mother-in-law";

export type ClaimCategory = "Self" | "Spouse" | "Child" | "Parent";

export const CLAIM_AMOUNTS: Record<ClaimCategory, string> = {
  Self:   "KES 60,000",
  Spouse: "KES 50,000",
  Child:  "KES 40,000",
  Parent: "KES 20,000",
};

export interface Beneficiary {
  id: string;
  name: string;
  relationship: BeneficiaryRelationship;
  idNumber?: string;
  phone?: string;
  birthCertNo?: string;
}

export interface User {
  id: string;
  name: string;
  surname?: string;
  gender?: "M" | "F";
  email?: string;
  role: Role;
  memberNo: string;
  personalNo?: string;
  phone: string;
  school: string;
  subCounty?: SubCounty;
  zone?: string;
  beneficiaries?: Beneficiary[];
  active: boolean;
  joinDate: string;
}

export interface MemberStats {
  daysBookedThisYear: number;
  upcomingBookings: number;
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  monthlyBookings: { month: string; bookings: number }[];
}

export interface AdminStats {
  totalBookingsYear: number;
  totalBookingsMonth: number;
  claimsThisMonth: number;
  approvalRate: number;
  activeMembers: number;
  monthlyClaimsChart: { month: string; submitted: number; approved: number }[];
  monthlyBookingsChart: { month: string; bookings: number }[];
  claimStatusBreakdown: { name: string; value: number; color: string }[];
}

export interface Booking {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  destination: string;
  purpose: string;
  passengers: number;
  status: Status;
  remarks?: string;
  passengersList?: string | null;
  paymentProof?: string | null;
  createdAt: string;
}

export interface SharedDocument {
  id: string;
  title: string;
  filename: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Claim {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  type: string;
  claimant: string;
  claimantTsc?: string | null;
  relationship: string;
  details: string;
  amount: string;
  status: Status;
  remarks?: string;
  documents: string[];
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: "upcoming" | "past";
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: "claim" | "booking" | "event";
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  target: string;
  timestamp: string;
  details: string;
}
