export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";
  avatar?: string | null;
}

export interface Employee {
  id: string;
  employeeId: string;
  userId: string;
  name: string;
  email: string;
  companyEmail?: string | null;
  phone?: string | null;
  department: string;
  position: string;
  managerId?: string | null;
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED" | "RESIGNED";
  joinDate: string;
  salary: number;
  address?: string | null;
  dateOfBirth?: string | null;
  emergencyContact?: string | null;
  profileImage?: string | null;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  resumeUrl?: string | null;
  coverLetter?: string | null;
  experience: number;
  skills?: string | null;
  status:
    | "APPLIED"
    | "SCREENING"
    | "SHORTLISTED"
    | "INTERVIEW"
    | "EVALUATED"
    | "OFFERED"
    | "HIRED"
    | "REJECTED";
  source?: string | null;
  jobOpeningId?: string | null;
  aiScreenScore?: number | null;
  notes?: string | null;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  location: string;
  type: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  openings: number;
  status: "OPEN" | "CLOSED" | "ON_HOLD";
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName?: string;
  scheduledAt: string;
  duration: number;
  type: string;
  location?: string | null;
  panelMembers: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  feedback?: string | null;
  rating?: number | null;
  notes?: string | null;
}

export interface Evaluation {
  id: string;
  candidateId: string;
  technicalScore: number;
  hrScore: number;
  communicationScore: number;
  culturalFitScore: number;
  overallScore: number;
  recommendation: "STRONG_HIRE" | "HIRE" | "MAYBE" | "NO_HIRE" | "PENDING";
  aiSummary?: string | null;
  evaluatorNotes?: string | null;
}

export interface Offer {
  id: string;
  candidateId: string;
  candidateName?: string;
  salary: number;
  joiningDate: string;
  department: string;
  position: string;
  benefits?: string | null;
  offerLetterUrl?: string | null;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  expiresAt?: string | null;
  notes?: string | null;
}

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  result?: string;
  updatedAt?: string;
}

export interface Onboarding {
  id: string;
  employeeId: string;
  employeeName?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  steps: string; // JSON String
  welcomeLetter?: string | null;
  checklist?: string | null; // JSON String
  orientationSchedule?: string | null; // JSON String
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  category: string;
  mandatory: boolean;
  duration: number;
}

export interface TrainingAssignment {
  id: string;
  employeeId: string;
  employeeName?: string;
  trainingId: string;
  trainingTitle?: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  progress: number;
  startedAt?: string | null;
  completedAt?: string | null;
  certificateUrl?: string | null;
  score?: number | null;
}

export interface Payroll {
  id: string;
  employeeId: string;
  employeeName?: string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  tax: number;
  bonuses: number;
  netPay: number;
  status: "DRAFT" | "PROCESSED" | "PAID" | "FAILED";
  paidAt?: string | null;
  payslipUrl?: string | null;
  notes?: string | null;
}

export interface Leave {
  id: string;
  employeeId: string;
  employeeName?: string;
  type: "CASUAL" | "SICK" | "ANNUAL" | "MATERNITY" | "PATERNITY" | "UNPAID";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName?: string;
  quarter: number;
  year: number;
  rating: number;
  feedback?: string | null;
  goals?: string | null; // JSON String
  achievements?: string | null; // JSON String
  areasOfImprovement?: string | null;
  aiSuggestions?: string | null;
  reviewedBy?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export interface Promotion {
  id: string;
  employeeId: string;
  employeeName?: string;
  fromPosition: string;
  toPosition: string;
  fromSalary: number;
  toSalary: number;
  salaryRevision: number;
  reason?: string | null;
  status: "PROPOSED" | "APPROVED" | "REJECTED" | "IMPLEMENTED";
  effectiveDate?: string | null;
}

export interface EngagementSurvey {
  id: string;
  title: string;
  description?: string | null;
  questions: string; // JSON String
  status: "DRAFT" | "ACTIVE" | "CLOSED";
}

export interface Recognition {
  id: string;
  employeeId: string;
  employeeName?: string;
  awardedBy: string;
  title: string;
  description?: string | null;
  category: string;
  points: number;
  createdAt: string;
}

export interface ExitProcess {
  id: string;
  employeeId: string;
  employeeName?: string;
  resignationDate: string;
  lastWorkingDate: string;
  reason: string;
  exitInterviewDone: boolean;
  exitInterviewNotes?: string | null;
  assetReturn: string; // JSON checklist
  clearanceStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  settlementAmount?: number | null;
  settlementStatus: "PENDING" | "PROCESSED" | "PAID";
  status: "INITIATED" | "IN_PROGRESS" | "COMPLETED";
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR" | "WORKFLOW";
  read: boolean;
  link?: string | null;
  createdAt: string;
}

export interface WorkflowLog {
  id: string;
  workflowType: string;
  input: string;
  steps: string; // JSON String
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  result?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  openRecruitment: number;
  interviewsToday: number;
  pendingApprovals: number;
  leaveRequests: number;
  payrollStatus: string;
  performanceReviews: number;
  employeeEngagementScore: number;
}
