import type { User, Booking, Claim, Event, Notification, AuditLog } from "./types";

export const mockUsers: User[] = [
  { id: "u1", name: "Admin",  surname: "User",    gender: "M" as const, email: "admin@kuppet.kisii.ke",  role: "admin",  memberNo: "ADM-001", phone: "+254700000001", school: "KUPPET Kisii HQ",      subCounty: "Kisii Central",  zone: "HQ",     active: true,  joinDate: "2020-01-01" },
  { id: "u2", name: "Jane",   surname: "Wanjiku", gender: "F" as const, email: "jane@school.ac.ke",      role: "member", memberNo: "MEM-001", phone: "+254711000001", school: "Kisii High School",    subCounty: "Kisii Central",  zone: "Zone A", active: true,  joinDate: "2021-03-15" },
  { id: "u3", name: "Peter",  surname: "Ongeri",  gender: "M" as const, email: "peter@school.ac.ke",     role: "member", memberNo: "MEM-002", phone: "+254722000002", school: "Nyabururu Boys",       subCounty: "Kisii South",    zone: "Zone B", active: true,  joinDate: "2021-06-20" },
  { id: "u4", name: "Mary",   surname: "Moraa",   gender: "F" as const, email: "mary@school.ac.ke",      role: "member", memberNo: "MEM-003", phone: "+254733000003", school: "Nyabururu Girls",      subCounty: "Kisii North",    zone: "Zone C", active: true,  joinDate: "2022-01-10" },
  { id: "u5", name: "John",   surname: "Omari",   gender: "M" as const, email: "john@school.ac.ke",      role: "member", memberNo: "MEM-004", phone: "+254744000004", school: "Manga Boys",           subCounty: "Manga",          zone: "Zone D", active: false, joinDate: "2022-04-05" },
  { id: "u6", name: "Grace",  surname: "Kemunto", gender: "F" as const, email: "grace@school.ac.ke",     role: "member", memberNo: "MEM-005", phone: "+254755000005", school: "Kisii Girls High",     subCounty: "Kisii South",    zone: "Zone E", active: true,  joinDate: "2023-02-18" },
];

export const mockBookings: Booking[] = [
  { id: "BK-001", memberId: "u2", memberName: "Jane Wanjiku",  date: "2026-01-10", destination: "Nairobi",       purpose: "TSC meeting",              passengers: 3,  status: "approved", createdAt: "2026-01-05" },
  { id: "BK-002", memberId: "u2", memberName: "Jane Wanjiku",  date: "2026-02-14", destination: "Kisumu",         purpose: "Workshop attendance",      passengers: 2,  status: "approved", createdAt: "2026-02-10" },
  { id: "BK-003", memberId: "u2", memberName: "Jane Wanjiku",  date: "2026-03-18", destination: "Nairobi",        purpose: "County education forum",   passengers: 4,  status: "pending",  createdAt: "2026-03-12" },
  { id: "BK-004", memberId: "u2", memberName: "Jane Wanjiku",  date: "2026-02-25", destination: "Migori",         purpose: "Sports day",               passengers: 10, status: "rejected", remarks: "Van unavailable on this date. Please rebook.", createdAt: "2026-02-20" },
  { id: "BK-005", memberId: "u3", memberName: "Peter Ongeri",  date: "2026-01-20", destination: "Nairobi",        purpose: "KUPPET national meeting",  passengers: 2,  status: "approved", createdAt: "2026-01-15" },
  { id: "BK-006", memberId: "u3", memberName: "Peter Ongeri",  date: "2026-03-05", destination: "Kisii Town",     purpose: "Welfare committee",        passengers: 5,  status: "pending",  createdAt: "2026-03-01" },
  { id: "BK-007", memberId: "u4", memberName: "Mary Moraa",    date: "2026-02-08", destination: "Nairobi",        purpose: "Training seminar",         passengers: 3,  status: "approved", createdAt: "2026-02-03" },
  { id: "BK-008", memberId: "u6", memberName: "Grace Kemunto", date: "2026-03-22", destination: "Kisumu",         purpose: "Inter-school games",       passengers: 8,  status: "pending",  createdAt: "2026-03-18" },
];

export const mockClaims: Claim[] = [
  { id: "CLM-001", memberId: "u2", memberName: "Jane Wanjiku",  type: "Burial Claim", claimant: "Jane Wanjiku",  relationship: "Spouse",  details: "Claim for burial of spouse.",  amount: "KES 50,000", status: "approved", remarks: "All documents verified. Approved.", documents: ["MEM-001_CLM-001_BurialPermit_20260120.pdf", "MEM-001_CLM-001_Payslip_20260120.pdf"], createdAt: "2026-01-20" },
  { id: "CLM-002", memberId: "u2", memberName: "Jane Wanjiku",  type: "Burial Claim", claimant: "Jane Wanjiku",  relationship: "Parent",  details: "Claim for burial of mother.",  amount: "KES 50,000", status: "pending",  documents: ["MEM-001_CLM-002_BurialPermit_20260301.pdf", "MEM-001_CLM-002_Payslip_20260301.pdf"], createdAt: "2026-03-01" },
  { id: "CLM-003", memberId: "u3", memberName: "Peter Ongeri",  type: "Burial Claim", claimant: "Peter Ongeri",  relationship: "Child",   details: "Claim for burial of child.",   amount: "KES 50,000", status: "rejected", remarks: "Payslip is older than 30 days. Please resubmit with a current payslip.", documents: ["MEM-002_CLM-003_BurialPermit_20260115.pdf", "MEM-002_CLM-003_Payslip_20260115.pdf"], createdAt: "2026-01-15" },
  { id: "CLM-004", memberId: "u4", memberName: "Mary Moraa",    type: "Burial Claim", claimant: "Mary Moraa",    relationship: "Sibling", details: "Claim for burial of brother.", amount: "KES 50,000", status: "approved", remarks: "Approved.", documents: ["MEM-003_CLM-004_BurialPermit_20260210.pdf", "MEM-003_CLM-004_Payslip_20260210.pdf"], createdAt: "2026-02-10" },
  { id: "CLM-005", memberId: "u6", memberName: "Grace Kemunto", type: "Burial Claim", claimant: "Grace Kemunto", relationship: "Parent",  details: "Claim for burial of father.",  amount: "KES 50,000", status: "pending",  documents: ["MEM-005_CLM-005_BurialPermit_20260315.pdf", "MEM-005_CLM-005_Payslip_20260315.pdf"], createdAt: "2026-03-15" },
];

export const mockEvents: Event[] = [
  { id: "ev1", title: "Annual General Meeting 2026",  date: "2026-03-15", time: "9:00 AM - 4:00 PM",  location: "Kisii Teachers Centre",       description: "Join us for the 2026 AGM to discuss welfare matters and elect new officials.", status: "upcoming" },
  { id: "ev2", title: "Teachers Welfare Workshop",    date: "2026-04-05", time: "10:00 AM - 1:00 PM", location: "County Hall, Kisii Town",      description: "Workshop on financial literacy and welfare benefits for KUPPET members.",    status: "upcoming" },
  { id: "ev3", title: "Inter-County Sports Day",      date: "2026-05-20", time: "8:00 AM - 5:00 PM",  location: "Gusii Stadium, Kisii",         description: "Annual sports competition bringing together teachers from across the county.", status: "upcoming" },
  { id: "ev4", title: "End of Year Celebration",      date: "2025-12-10", time: "2:00 PM - 8:00 PM",  location: "Kisii Mwalimu Sacco Hall",     description: "An evening of celebration and recognition for outstanding KUPPET members.",   status: "past" },
  { id: "ev5", title: "Welfare Committee Meeting",    date: "2025-11-05", time: "10:00 AM - 12:00 PM",location: "Kisii KUPPET Office, Ngeka Centre", description: "Quarterly welfare committee review meeting.",                             status: "past" },
];

export const mockNotifications: Notification[] = [
  { id: "n1",  userId: "u2", message: "Your claim CLM-001 has been approved.",                                    type: "claim",   read: true,  createdAt: "2026-01-25" },
  { id: "n2",  userId: "u2", message: "Your booking BK-004 was rejected. Reason: Van unavailable on this date.", type: "booking", read: true,  createdAt: "2026-02-22" },
  { id: "n3",  userId: "u2", message: "New event: Annual General Meeting 2026 on March 15.",                     type: "event",   read: false, createdAt: "2026-03-01" },
  { id: "n4",  userId: "u2", message: "Your claim CLM-002 is under review.",                                     type: "claim",   read: false, createdAt: "2026-03-02" },
  { id: "n5",  userId: "u3", message: "Your claim CLM-003 was rejected. Reason: Payslip older than 30 days.",   type: "claim",   read: false, createdAt: "2026-01-20" },
  { id: "n6",  userId: "u3", message: "New event: Annual General Meeting 2026 on March 15.",                     type: "event",   read: false, createdAt: "2026-03-01" },
  { id: "n7",  userId: "u4", message: "Your claim CLM-004 has been approved.",                                   type: "claim",   read: false, createdAt: "2026-02-15" },
  { id: "n8",  userId: "u6", message: "New event: Annual General Meeting 2026 on March 15.",                     type: "event",   read: false, createdAt: "2026-03-01" },
  { id: "n9",  userId: "u1", message: "New claim submitted: CLM-002 by Jane Wanjiku — KES 50,000.",              type: "claim",   read: false, createdAt: "2026-03-01" },
  { id: "n10", userId: "u1", message: "New van booking request: BK-006 by Peter Ongeri to Kisii Town.",          type: "booking", read: false, createdAt: "2026-03-01" },
  { id: "n11", userId: "u1", message: "New claim submitted: CLM-005 by Grace Kemunto — KES 50,000.",             type: "claim",   read: false, createdAt: "2026-03-15" },
  { id: "n12", userId: "u1", message: "New van booking request: BK-008 by Grace Kemunto to Kisumu.",             type: "booking", read: true,  createdAt: "2026-03-18" },
];

export const mockAuditLogs: AuditLog[] = [
  { id: "al1",  action: "LOGIN",           performedBy: "Admin User",    target: "System",  timestamp: "2026-03-10 08:02:11", details: "Admin logged in." },
  { id: "al2",  action: "CLAIM_APPROVED",  performedBy: "Admin User",    target: "CLM-001", timestamp: "2026-01-25 10:15:33", details: "Claim CLM-001 approved for Jane Wanjiku." },
  { id: "al3",  action: "CLAIM_REJECTED",  performedBy: "Admin User",    target: "CLM-003", timestamp: "2026-01-20 14:22:05", details: "Claim CLM-003 rejected. Reason: Payslip older than 30 days." },
  { id: "al4",  action: "BOOKING_REJECTED",performedBy: "Admin User",    target: "BK-004",  timestamp: "2026-02-22 09:45:18", details: "Booking BK-004 rejected. Reason: Van unavailable." },
  { id: "al5",  action: "CLAIM_APPROVED",  performedBy: "Admin User",    target: "CLM-004", timestamp: "2026-02-15 11:30:00", details: "Claim CLM-004 approved for Mary Moraa." },
  { id: "al6",  action: "MEMBER_ADDED",    performedBy: "Admin User",    target: "MEM-005", timestamp: "2026-02-18 09:00:00", details: "New member Grace Kemunto added." },
  { id: "al7",  action: "MEMBER_DISABLED", performedBy: "Admin User",    target: "MEM-004", timestamp: "2026-03-01 16:10:44", details: "Member John Omari disabled." },
  { id: "al8",  action: "LOGIN",           performedBy: "Jane Wanjiku",  target: "System",  timestamp: "2026-03-10 08:30:00", details: "Member logged in." },
  { id: "al9",  action: "BOOKING_APPROVED",performedBy: "Admin User",    target: "BK-001",  timestamp: "2026-01-06 10:00:00", details: "Booking BK-001 approved for Jane Wanjiku." },
  { id: "al10", action: "EVENT_CREATED",   performedBy: "Admin User",    target: "ev1",     timestamp: "2026-02-28 14:00:00", details: "Event 'Annual General Meeting 2026' created." },
];
