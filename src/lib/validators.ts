import { z } from "zod";

// Authentication
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

// Candidate Details
export const candidateSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  experience: z.coerce.number().min(0, { message: "Experience cannot be negative" }),
  skills: z.string().optional(),
  jobOpeningId: z.string().optional(),
  notes: z.string().optional(),
});

// Interview Scheduling
export const interviewSchema = z.object({
  candidateId: z.string().min(1, { message: "Candidate is required" }),
  scheduledAt: z.string().min(1, { message: "Interview date & time is required" }),
  duration: z.coerce.number().min(15, { message: "Duration must be at least 15 minutes" }).default(60),
  type: z.string().min(1, { message: "Interview type is required" }), // Technical, HR, Cultural, etc.
  panelMembers: z.string().min(1, { message: "Panel members are required (comma separated)" }),
  location: z.string().optional(),
  notes: z.string().optional(),
});

// Candidate Evaluation
export const evaluationSchema = z.object({
  candidateId: z.string().min(1, { message: "Candidate is required" }),
  technicalScore: z.coerce.number().min(0).max(10),
  hrScore: z.coerce.number().min(0).max(10),
  communicationScore: z.coerce.number().min(0).max(10),
  culturalFitScore: z.coerce.number().min(0).max(10),
  recommendation: z.string().min(1, { message: "Recommendation is required" }), // STRONG_HIRE, HIRE, MAYBE, NO_HIRE
  evaluatorNotes: z.string().optional(),
});

// Offer Generation
export const offerSchema = z.object({
  candidateId: z.string().min(1, { message: "Candidate is required" }),
  salary: z.coerce.number().min(1000, { message: "Salary must be at least $1000" }),
  joiningDate: z.string().min(1, { message: "Joining date is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  benefits: z.string().optional(),
  notes: z.string().optional(),
});

// Leave Request
export const leaveSchema = z.object({
  type: z.string().min(1, { message: "Leave type is required" }), // SICK, ANNUAL, CASUAL, etc.
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  reason: z.string().min(5, { message: "Please provide a reason (at least 5 characters)" }),
});

// Performance Review
export const performanceSchema = z.object({
  employeeId: z.string().min(1, { message: "Employee is required" }),
  quarter: z.coerce.number().min(1).max(4),
  year: z.coerce.number().min(2020),
  rating: z.coerce.number().min(1).max(5),
  feedback: z.string().min(10, { message: "Feedback must be at least 10 characters" }),
  goals: z.string().optional(), // JSON string
  achievements: z.string().optional(), // JSON string
  areasOfImprovement: z.string().optional(),
});

// Promotion Recommendation
export const promotionSchema = z.object({
  employeeId: z.string().min(1, { message: "Employee is required" }),
  toPosition: z.string().min(2, { message: "Target position is required" }),
  toSalary: z.coerce.number().min(1000, { message: "Target salary must be at least $1000" }),
  reason: z.string().min(10, { message: "Please provide a detailed reason for promotion" }),
});

// Payroll Item
export const payrollSchema = z.object({
  employeeId: z.string().min(1, { message: "Employee is required" }),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020),
  baseSalary: z.coerce.number().min(0),
  allowances: z.coerce.number().min(0).default(0),
  deductions: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
  bonuses: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

// Create Employee (Standard Form)
export const employeeSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  department: z.string().min(1, { message: "Department is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  salary: z.coerce.number().min(0, { message: "Salary cannot be negative" }),
  managerId: z.string().optional(),
  status: z.string().default("ACTIVE"),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContact: z.string().optional(),
});

// Engagement Survey Form
export const surveySchema = z.object({
  title: z.string().min(2, { message: "Survey title is required" }),
  description: z.string().optional(),
  questions: z.string().min(10, { message: "Provide questions (JSON format or text list)" }),
});

// Exit Resignation Process
export const exitSchema = z.object({
  employeeId: z.string().min(1, { message: "Employee is required" }),
  resignationDate: z.string().min(1, { message: "Resignation date is required" }),
  lastWorkingDate: z.string().min(1, { message: "Last working date is required" }),
  reason: z.string().min(10, { message: "Please provide a reason (at least 10 characters)" }),
});
