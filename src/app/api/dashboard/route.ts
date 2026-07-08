import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "HR";
    const email = searchParams.get("email") || "";

    // Find the employee record via userId from the logged-in user's email
    let employee = null;
    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        employee = await prisma.employee.findUnique({ where: { userId: user.id } });
      }
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // ---- BASE QUERIES (used across roles) ----
    const totalEmployees = await prisma.employee.count();
    const openRecruitment = await prisma.jobOpening.count({ where: { status: "OPEN" } });

    // ---- HR ----
    if (role === "HR") {
      const activeEmployees = await prisma.employee.count({ where: { status: "ACTIVE" } });
      const candidates = await prisma.candidate.count();
      const interviewsScheduled = await prisma.interview.count({ where: { status: "SCHEDULED" } });
      const pendingOffers = await prisma.offer.count({ where: { status: "SENT" } });
      const onboardingProgress = await prisma.onboarding.count({ where: { status: "IN_PROGRESS" } });
      const activeTrainings = await prisma.trainingAssignment.count({ where: { status: "IN_PROGRESS" } });
      const pendingLeaves = await prisma.leave.count({ where: { status: "PENDING" } });

      const feedbacks = await prisma.engagementFeedback.findMany({ select: { rating: true } });
      const totalFeedbackRating = feedbacks.reduce((acc, f) => acc + f.rating, 0);
      const avgRating = feedbacks.length > 0 ? (totalFeedbackRating / feedbacks.length).toFixed(1) : "4.2";

      // Candidates by status chart
      const allCandidates = await prisma.candidate.findMany({ select: { status: true } });
      const statusMap: Record<string, number> = {};
      allCandidates.forEach((c) => { statusMap[c.status] = (statusMap[c.status] || 0) + 1; });
      const candidateChart = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

      // Training completion
      const trainingAssignments = await prisma.trainingAssignment.findMany({ select: { status: true } });
      const tStatusMap: Record<string, number> = {};
      trainingAssignments.forEach((t) => { tStatusMap[t.status] = (tStatusMap[t.status] || 0) + 1; });
      const trainingChart = Object.entries(tStatusMap).map(([name, value]) => ({ name, value }));

      const workflowLogs = await prisma.workflowLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
      const activities = workflowLogs.map((log) => ({
        id: log.id, title: `${log.workflowType} Workflow ${log.status}`,
        description: log.result || log.input,
        type: log.workflowType === "ONBOARDING" ? "NEW_HIRE" : log.workflowType === "PROMOTION" ? "PROMOTION" : "SYSTEM",
        createdAt: log.createdAt.toISOString(),
      }));

      return NextResponse.json({
        role: "HR",
        stats: {
          totalEmployees: activeEmployees, openRecruitment, candidatesCount: candidates,
          interviewsScheduled, pendingOffers, onboardingProgress, activeTrainings,
          pendingLeaves, employeeEngagementScore: parseFloat(avgRating),
        },
        candidateChart, trainingChart, activities,
      });
    }

    // ---- MANAGER ----
    if (role === "MANAGER" && employee) {
      const teamSize = await prisma.employee.count({ where: { managerId: employee.id } });
      const teamMemberIds = (await prisma.employee.findMany({ where: { managerId: employee.id }, select: { id: true } })).map(e => e.id);

      const pendingLeaveApprovals = await prisma.leave.count({
        where: { employeeId: { in: teamMemberIds }, status: "PENDING" },
      });
      const reviewsDue = await prisma.performanceReview.count({
        where: { employeeId: { in: teamMemberIds }, status: "PENDING" },
      });
      const teamTrainingsDue = await prisma.trainingAssignment.count({
        where: { employeeId: { in: teamMemberIds }, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
      });

      const recognitions = await prisma.recognition.findMany({
        where: { employeeId: { in: teamMemberIds } },
        orderBy: { createdAt: "desc" }, take: 3,
        include: { employee: { select: { name: true } } },
      });

      const payrolls = await prisma.payroll.findMany({
        where: { employeeId: { in: teamMemberIds } },
        orderBy: [{ year: "asc" }, { month: "asc" }],
      });
      const expMap: Record<string, number> = {};
      payrolls.forEach((pay) => {
        const key = `${monthNames[pay.month - 1]} ${pay.year}`;
        expMap[key] = (expMap[key] || 0) + pay.netPay;
      });
      const payrollData = Object.entries(expMap).map(([name, value]) => ({ name, value }));

      return NextResponse.json({
        role: "MANAGER",
        stats: { teamSize, pendingLeaveApprovals, reviewsDue, teamTrainingsDue, openRecruitment },
        recognitions: recognitions.map(r => ({ id: r.id, title: r.title, employeeName: r.employee.name, points: r.points })),
        payrollData,
      });
    }

    // ---- EMPLOYEE ----
    if (role === "EMPLOYEE" && employee) {
      const myLeaves = await prisma.leave.findMany({
        where: { employeeId: employee.id },
        orderBy: { startDate: "desc" },
      });
      const approvedLeaves = myLeaves.filter(l => l.status === "APPROVED");
      const totalLeaveDays = approvedLeaves.reduce((acc, l) => acc + l.days, 0);
      const pendingLeaveDays = myLeaves.filter(l => l.status === "PENDING").reduce((acc, l) => acc + l.days, 0);

      const myPayroll = await prisma.payroll.findMany({
        where: { employeeId: employee.id },
        orderBy: [{ year: "asc" }, { month: "asc" }],
      });
      const lastPayroll = myPayroll[myPayroll.length - 1];

      const myTrainings = await prisma.trainingAssignment.findMany({
        where: { employeeId: employee.id },
        include: { training: { select: { title: true } } },
      });
      const completedTrainings = myTrainings.filter(t => t.status === "COMPLETED").length;
      const totalTrainings = myTrainings.length;
      const inProgressTraining = myTrainings.find(t => t.status === "IN_PROGRESS");

      const myReviews = await prisma.performanceReview.findMany({
        where: { employeeId: employee.id },
        orderBy: { year: "desc" },
      });
      const lastReview = myReviews[0];

      const myRecognitions = await prisma.recognition.findMany({
        where: { employeeId: employee.id },
        orderBy: { createdAt: "desc" },
      });

      const payrollChart = myPayroll.map(p => ({
        name: `${monthNames[p.month - 1]} ${p.year}`,
        value: p.netPay,
      }));

      return NextResponse.json({
        role: "EMPLOYEE",
        stats: {
          totalLeaveDays: 20 - totalLeaveDays, // 20 days annual entitlement
          pendingLeaveDays,
          lastPayrollAmount: lastPayroll?.netPay || 0,
          lastPayrollMonth: lastPayroll ? `${monthNames[lastPayroll.month - 1]} ${lastPayroll.year}` : "N/A",
          completedTrainings,
          totalTrainings,
          lastReviewRating: lastReview?.rating || null,
          recognitionsCount: myRecognitions.length,
        },
        myLeaves: myLeaves.slice(0, 3),
        inProgressTraining: inProgressTraining ? {
          title: inProgressTraining.training.title,
          progress: inProgressTraining.progress,
          status: inProgressTraining.status,
        } : null,
        lastReview: lastReview ? {
          rating: lastReview.rating,
          feedback: lastReview.feedback,
          quarter: lastReview.quarter,
          year: lastReview.year,
          aiSuggestions: lastReview.aiSuggestions,
        } : null,
        payrollChart,
        recognitions: myRecognitions.slice(0, 3).map(r => ({
          id: r.id, title: r.title, description: r.description, points: r.points,
        })),
      });
    }

    // Fallback for manager/employee without record
    return NextResponse.json({ role, stats: {}, message: "No employee record found" });
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
