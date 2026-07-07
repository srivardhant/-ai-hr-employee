import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine Tailwind CSS classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in USD
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format Date to Month DD, YYYY
export function formatDate(date: Date | string | null): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format Date & Time
export function formatDateTime(date: Date | string | null): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Generate Employee ID
export function generateEmployeeId(sequence: number): string {
  return `EMP-${String(sequence).padStart(3, "0")}`;
}

// Generate Company Email
export function generateCompanyEmail(name: string): string {
  const parts = name.toLowerCase().trim().split(/\s+/);
  const first = parts[0] || "employee";
  const last = parts[parts.length - 1] || "";
  const base = last ? `${first}.${last}` : first;
  // Remove special characters
  const sanitized = base.replace(/[^a-z0-9.]/g, "");
  return `${sanitized}@aihr.com`;
}

// Get initials from a name
export function getInitials(name: string): string {
  if (!name) return "EE";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Sleep utility for animations
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Calculate age from date of birth
export function calculateAge(dob: Date | string): number {
  const birthDate = typeof dob === "string" ? new Date(dob) : dob;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Get tailwind styling classes for different statuses
export function getStatusColor(status: string): string {
  const s = status.toUpperCase();
  switch (s) {
    case "ACTIVE":
    case "COMPLETED":
    case "PAID":
    case "APPROVED":
    case "ACCEPTED":
    case "HIRED":
    case "STRONG_HIRE":
    case "OPEN":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30";
    case "PENDING":
    case "DRAFT":
    case "ASSIGNED":
    case "PROPOSED":
    case "SCREENING":
    case "MAYBE":
    case "ON_HOLD":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30";
    case "REJECTED":
    case "FAILED":
    case "CANCELLED":
    case "TERMINATED":
    case "RESIGNED":
    case "NO_HIRE":
    case "CLOSED":
    case "OVERDUE":
      return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30";
    case "IN_PROGRESS":
    case "RUNNING":
    case "INTERVIEW":
    case "SENT":
    case "HIRE":
      return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200/50 dark:border-sky-800/30";
    case "SCHEDULED":
    case "SHORTLISTED":
    case "INITIATED":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/30";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/30";
  }
}

// Generate random aesthetic gradient colors
export function generateRandomColor(name: string): string {
  const gradients = [
    "from-indigo-500 to-purple-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-violet-500 to-fuchsia-500",
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
}
