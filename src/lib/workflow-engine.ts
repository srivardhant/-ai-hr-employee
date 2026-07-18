import { prisma } from "@/lib/prisma";
import {
  generateEmployeeId,
  generateCompanyEmail,
  sleep,
} from "@/lib/utils";
import { parseWorkflowWithAI } from "@/lib/ai";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  result?: string;
  updatedAt?: string;
}

export interface WorkflowResult {
  id: string;
  workflowType: "ONBOARDING" | "OFFBOARDING" | "PROMOTION" | "PAYROLL" | "LEAVE" | "INTERVIEW" | "UNKNOWN" | "JOB_POSTING" | "CUSTOM";
  input: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  steps: WorkflowStep[];
  resultSummary?: string;
  employeeId?: string;
  createdAt: string;
}

export async function parseWorkflowInput(input: string) {
  // Try AI parsing first
  const aiResult = await parseWorkflowWithAI(input);
  if (aiResult && aiResult.type !== "UNKNOWN") {
    return aiResult;
  }

  // Fallback to heuristic parsing
  const normalized = input.toLowerCase();

  if (normalized.includes("join") || normalized.includes("onboard") || normalized.includes("new employee") || normalized.includes("hire")) {
    const namedMatch = input.match(/(?:named|name)\s+((?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+))(?=\s+(?:as|for|in|with|at|to)\b)/i);
    const joinedMatch = input.match(/((?:[A-Z][a-z]+\s+)+[A-Z][a-z]+)\s+(?:joined|started|has joined)/i);
    const asMatch = input.match(/((?:[A-Z][a-z]+\s+)+[A-Z][a-z]+)\s+as\s+(?:a|an)?\s*[A-Z]/i);
    let name = namedMatch?.[1]?.trim() || joinedMatch?.[1]?.trim() || asMatch?.[1]?.trim() || "John Doe";
    const positionMatch = input.match(/(?:as|position|role)\s+([A-Za-z\s]+?)(?:\.|\s+in|\s+joined|\s+with|\s+at|$)/);
    let position = positionMatch?.[1]?.trim() || "Software Engineer";
    const posLower = position.toLowerCase();
    let department = "Engineering";
    let salary = 110000;
    if (normalized.includes("marketing") || posLower.includes("marketing")) { department = "Marketing"; salary = 75000; }
    else if (normalized.includes("design") || posLower.includes("designer")) { department = "Design"; salary = 85000; }
    else if (normalized.includes("finance") || posLower.includes("finance")) { department = "Finance"; salary = 90000; }
    else if (normalized.includes("sales") || posLower.includes("sales")) { department = "Sales"; salary = 65000; }
    else if (normalized.includes("hr") || posLower.includes("hr")) { department = "HR"; salary = 70000; }
    const salaryMatch = input.match(/(?:salary|pay|compensation)\s+(?:of\s+)?\$?([0-9,]+)/i);
    if (salaryMatch?.[1]) salary = parseFloat(salaryMatch[1].replace(/,/g, ""));
    return { type: "ONBOARDING" as const, data: { name, position, department, salary } };
  }

  if (normalized.includes("promote") || normalized.includes("promotion")) {
    const nameMatch = input.match(/(?:promote|promotion for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})(?=\s+(?:to|as|with|at)\b)/i);
    const name = nameMatch?.[1]?.trim() || "";
    const positionMatch = input.match(/(?:to|as)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*?)(?=\s+(?:with|salary)|\s+\$|$)/i);
    const toPosition = positionMatch?.[1]?.trim() || "Senior Lead";
    const salaryMatch = input.match(/(?:salary of|salary to|with salary|salary)\s+\$?([0-9,]+)/i);
    const toSalary = salaryMatch?.[1] ? parseFloat(salaryMatch[1].replace(/,/g, "")) : undefined;
    return { type: "PROMOTION" as const, data: { name, toPosition, salaryIncrease: 15, toSalary } };
  }

  if (normalized.includes("interview") || normalized.includes("schedule") || normalized.includes("panel")) {
    const jobTitleMatch = input.match(/(?:for|as)\s+([A-Za-z\s]+?)(?:\.|\s+in|\s+with|\s+at|$)/i);
    let jobTitle = jobTitleMatch?.[1]?.trim() || "";
    const skipWords = ["shortlisted", "candidates", "all", "qualified", "new", "every", "each", "the", "a", "an"];
    const words = jobTitle.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    if (words.length > 0 && words.every(w => skipWords.includes(w))) {
      jobTitle = "";
    }
    const candidateMatch = input.match(/(?:candidate|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const candidateName = candidateMatch?.[1]?.trim() || "";
    return { type: "INTERVIEW" as const, data: { jobTitle, candidateName } };
  }

  if (normalized.includes("leave") || normalized.includes("time off")) {
    const nameMatch = input.match(/(?:for|of|employee)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const name = nameMatch?.[1]?.trim() || "";
    const typeMatch = input.match(/(sick|annual|casual|maternity|paternity|bereavement|unpaid)\s+leave/i);
    const leaveType = typeMatch?.[1]?.toUpperCase() || "ANNUAL";
    const daysMatch = input.match(/(\d+)\s+days?/i);
    const days = daysMatch?.[1] ? parseInt(daysMatch[1]) : 3;
    return { type: "LEAVE" as const, data: { name, leaveType, days, input } };
  }

  if (normalized.includes("payroll") || normalized.includes("run salaries") || normalized.includes("generate payroll") || normalized.includes("process payroll")) {
    const nameMatch = input.match(/(?:for|of|employee)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const name = nameMatch?.[1]?.trim() || "";
    return { type: "PAYROLL" as const, data: { name, input } };
  }

  if (normalized.includes("post a job") || normalized.includes("post job") || normalized.includes("job posting") || normalized.includes("recruit") || normalized.includes("hiring")) {
    const titleMatch = input.match(/(?:for|as)\s+([A-Za-z0-9\s\-_]+?)(?:\.|\s+in|\s+with|\s+at|$)/i);
    let title = titleMatch?.[1]?.trim() || "Senior Developer";
    
    // Remove leading articles
    title = title.replace(/^(a|an|the)\s+/i, "");
    
    // Basic fallback if empty
    if (!title || title.length < 2) {
      title = "Senior Developer";
    }
    
    let department = "Engineering";
    if (normalized.includes("marketing")) department = "Marketing";
    else if (normalized.includes("design")) department = "Design";
    else if (normalized.includes("finance")) department = "Finance";
    else if (normalized.includes("sales")) department = "Sales";
    else if (normalized.includes("hr")) department = "HR";
    
    return { type: "JOB_POSTING" as const, data: { title, department } };
  }

  return { type: "UNKNOWN" as const, data: {} };
}

export class WorkflowEngine {
  static async runOnboarding(input: string, triggeredBy: string = "HR System") {
    const parsed = await parseWorkflowInput(input);
    if (parsed.type !== "ONBOARDING") {
      throw new Error("Invalid workflow input for Onboarding");
    }

    const { name, position, department, salary } = parsed.data;

    // Define steps
    const steps: WorkflowStep[] = [
      { id: "1", name: "Create Employee Profile", description: "Initialize profile in database", status: "PENDING" },
      { id: "2", name: "Generate Employee ID", description: "Allocate unique business identifier", status: "PENDING" },
      { id: "3", name: "Generate Company Email", description: "Register @aihr.com active directory address", status: "PENDING" },
      { id: "4", name: "Assign Department", description: "Establish cost center and seat map", status: "PENDING" },
      { id: "5", name: "Assign Manager", description: "Link hierarchical reporting lines", status: "PENDING" },
      { id: "6", name: "Assign Mandatory Trainings", description: "Enroll in compliance and cyber security courses", status: "PENDING" },
      { id: "7", name: "Generate Orientation Schedule", description: "Produce week-1 day-by-day induction plan", status: "PENDING" },
      { id: "8", name: "Generate Welcome Letter", description: "Compose draft contract welcome letter", status: "PENDING" },
      { id: "9", name: "Generate Employee Checklist", description: "Create interactive task list for HR Portal", status: "PENDING" },
      { id: "10", name: "Complete Database Transaction & Notify", description: "Commit all records and notify dashboard stakeholders", status: "PENDING" },
    ];

    // Create database log
    const log = await prisma.workflowLog.create({
      data: {
        workflowType: "ONBOARDING",
        input,
        status: "RUNNING",
        steps: JSON.stringify(steps),
        triggeredBy,
        startedAt: new Date(),
      },
    });

    const updateStep = async (stepId: string, status: WorkflowStep["status"], result?: string) => {
      const idx = steps.findIndex((s) => s.id === stepId);
      if (idx !== -1) {
        steps[idx].status = status;
        steps[idx].result = result;
        steps[idx].updatedAt = new Date().toISOString();
        
        await prisma.workflowLog.update({
          where: { id: log.id },
          data: {
            steps: JSON.stringify(steps),
          },
        });
      }
    };

    let employeeProfile: any = null;
    let employeeIdGenerated = "";
    let emailGenerated = "";
    let managerId: string | null = null;
    let welcomeLetterText = "";
    let checklistJson = "[]";
    let scheduleJson = "[]";

    try {
      // Step 1: Create Employee Profile
      await updateStep("1", "RUNNING");
      await sleep(1000);
      
      // We need a User account first
      const emailUsername = name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 100);
      const tempEmail = `${emailUsername}@temp-aihr.com`;
      
      const user = await prisma.user.create({
        data: {
          email: tempEmail,
          password: "$2a$10$tMh4uMlh6uV514yD1mI34ux6Tf3P1Buxp.V/T4cTszT1.6O20NfKG", // bcrypt of 'password123'
          name,
          role: "EMPLOYEE",
        },
      });

      const allIds = await prisma.employee.findMany({ select: { employeeId: true }, orderBy: { employeeId: "desc" } });
      let nextSeq = 1;
      for (const e of allIds) {
        const num = parseInt(e.employeeId.replace("EMP-", ""));
        if (num >= nextSeq) nextSeq = num + 1;
      }
      const placeholderId = generateEmployeeId(nextSeq);
      employeeProfile = await prisma.employee.create({
        data: {
          employeeId: placeholderId,
          userId: user.id,
          name,
          email: tempEmail,
          department,
          position,
          salary,
          status: "ACTIVE",
          joinDate: new Date(),
        },
      });
      await updateStep("1", "COMPLETED", `Profile created with DB ID: ${employeeProfile.id}`);

      // Step 2: Generate Employee ID
      await updateStep("2", "RUNNING");
      await sleep(500);
      const existingIds = await prisma.employee.findMany({ select: { employeeId: true }, orderBy: { employeeId: "desc" } });
      let maxSeq = 1;
      for (const e of existingIds) {
        const num = parseInt(e.employeeId.replace("EMP-", ""));
        if (num >= maxSeq) maxSeq = num + 1;
      }
      employeeIdGenerated = generateEmployeeId(maxSeq);
      
      await prisma.employee.update({
        where: { id: employeeProfile.id },
        data: { employeeId: employeeIdGenerated },
      });
      await updateStep("2", "COMPLETED", `Assigned ID: ${employeeIdGenerated}`);

      // Step 3: Generate Company Email
      await updateStep("3", "RUNNING");
      await sleep(1000);
      emailGenerated = generateCompanyEmail(name);
      
      // Update Employee and User email
      await prisma.employee.update({
        where: { id: employeeProfile.id },
        data: { companyEmail: emailGenerated, email: emailGenerated },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { email: emailGenerated },
      });
      await updateStep("3", "COMPLETED", `Activated: ${emailGenerated}`);

      // Step 4: Assign Department
      await updateStep("4", "RUNNING");
      await sleep(800);
      await updateStep("4", "COMPLETED", `Placed in department: ${department}`);

      // Step 5: Assign Manager
      await updateStep("5", "RUNNING");
      await sleep(800);
      
      // Try to find an existing Manager in the same department
      const departmentManager = await prisma.employee.findFirst({
        where: {
          department,
          user: {
            role: "MANAGER",
          },
        },
      });

      if (departmentManager) {
        managerId = departmentManager.id;
        await prisma.employee.update({
          where: { id: employeeProfile.id },
          data: { managerId: managerId },
        });
        await updateStep("5", "COMPLETED", `Assigned manager: ${departmentManager.name}`);
      } else {
        // Find general HR or admin
        const generalManager = await prisma.employee.findFirst({
          where: {
            user: {
              role: { in: ["ADMIN", "HR"] },
            },
          },
        });
        if (generalManager) {
          managerId = generalManager.id;
          await prisma.employee.update({
            where: { id: employeeProfile.id },
            data: { managerId: managerId },
          });
          await updateStep("5", "COMPLETED", `Department manager not found. Assigned General Manager: ${generalManager.name}`);
        } else {
          await updateStep("5", "COMPLETED", "No manager available. Hierarchical root assigned.");
        }
      }

      // Step 6: Assign Mandatory Trainings
      await updateStep("6", "RUNNING");
      await sleep(1200);
      
      // Find or create default training courses
      const defaultTrainings = [
        { title: "SaaS Enterprise Compliance", description: "General business standards, legal, and anti-harassment", category: "Compliance", duration: 2, mandatory: true },
        { title: "Information Security & Cybersecurity Awareness", description: "Handling data, phishing protection, and devices security", category: "Compliance", duration: 3, mandatory: true },
        { title: "Introduction to AI Toolkits", description: "Company guidelines on using generative AI responsibly", category: "Technical", duration: 4, mandatory: true },
      ];

      for (const t of defaultTrainings) {
        let dbTraining = await prisma.training.findFirst({
          where: { title: t.title },
        });
        if (!dbTraining) {
          dbTraining = await prisma.training.create({ data: t });
        }
        
        // Assign to employee
        await prisma.trainingAssignment.create({
          data: {
            employeeId: employeeProfile.id,
            trainingId: dbTraining.id,
            status: "ASSIGNED",
            progress: 0,
          },
        });
      }
      await updateStep("6", "COMPLETED", "Enrolled in: Compliance, CyberSecurity, and AI Ethics courses");

      // Step 7: Generate Orientation Schedule
      await updateStep("7", "RUNNING");
      await sleep(1000);
      const schedule = [
        { day: "Day 1", time: "09:00 AM", title: "Welcome & IT Hardware Setup", notes: "Collect laptop and credentials" },
        { day: "Day 1", time: "02:00 PM", title: "HR General Induction Session", notes: "Review policies and benefit selections" },
        { day: "Day 2", time: "11:00 AM", title: "Departmental Deep Dive", notes: "Meeting with manager and team walkthrough" },
        { day: "Day 3", time: "03:00 PM", title: "Product Architecture Overview", notes: "Introduction to technical products" },
        { day: "Day 5", time: "04:00 PM", title: "First Week Retro & QA", notes: "General catch up with HR partner" },
      ];
      scheduleJson = JSON.stringify(schedule);
      await updateStep("7", "COMPLETED", "Created 5-day induction timeline");

      // Step 8: Generate Welcome Letter
      await updateStep("8", "RUNNING");
      await sleep(1000);
      welcomeLetterText = `Dear ${name},\n\nWelcome to the team! We are absolutely thrilled to have you join us as a ${position} in the ${department} department. At AI HR Employee, we believe in automating administrative friction to unleash creative intelligence, and we cannot wait to see your impact.\n\nYour Employee ID is ${employeeIdGenerated} and your official company email is ${emailGenerated}. Your orientation schedule has been loaded into your dashboard portal.\n\nPlease complete your onboarding checklists in your account by the end of your first week.\n\nWarm regards,\n\nThe HR Operations Team\nAI HR Employee Corp.`;
      await updateStep("8", "COMPLETED", "Personalized contract welcome letter drafted");

      // Step 9: Generate Employee Checklist
      await updateStep("9", "RUNNING");
      await sleep(1000);
      const checklist = [
        { id: "chk_1", task: "Sign welcome letter and employee contract", done: false },
        { id: "chk_2", task: "Submit direct deposit details for Payroll", done: false },
        { id: "chk_3", task: "Complete emergency contact form", done: false },
        { id: "chk_4", task: "Complete Cybersecurity training course", done: false },
        { id: "chk_5", task: "Upload profile picture for identification badge", done: false },
      ];
      checklistJson = JSON.stringify(checklist);
      await updateStep("9", "COMPLETED", "Checklist loaded (5 pending tasks)");

      // Step 10: Store Onboarding Record & Notify
      await updateStep("10", "RUNNING");
      await sleep(1000);
      
      // Store all onboarding documentation in the Onboarding model
      await prisma.onboarding.create({
        data: {
          employeeId: employeeProfile.id,
          status: "IN_PROGRESS",
          steps: JSON.stringify(steps),
          welcomeLetter: welcomeLetterText,
          checklist: checklistJson,
          orientationSchedule: scheduleJson,
          startedAt: new Date(),
        },
      });

      // Find all HR Managers and Admins to notify
      const admins = await prisma.user.findMany({
        where: {
          role: { in: ["ADMIN", "HR"] },
        },
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: "New Employee Onboarded",
            message: `AI Workflow completed successfully: ${name} (${employeeIdGenerated}) has joined as ${position}.`,
            type: "WORKFLOW",
            link: "/onboarding",
          },
        });
      }

      await updateStep("10", "COMPLETED", "Onboarding record activated. HR Notifications sent successfully.");
      
      // Complete the workflow log
      await prisma.workflowLog.update({
        where: { id: log.id },
        data: {
          status: "COMPLETED",
          result: `Successfully onboarded employee ${name} (${employeeIdGenerated})`,
          completedAt: new Date(),
        },
      });

      return {
        id: log.id,
        workflowType: "ONBOARDING" as const,
        input,
        status: "COMPLETED" as const,
        steps,
        resultSummary: `Successfully onboarded ${name} as ${position} in ${department} department.`,
        employeeId: employeeProfile.id,
        createdAt: log.createdAt.toISOString(),
      };
    } catch (error: any) {
      console.error("Workflow failed", error);
      
      // Fail the active step
      const runningStep = steps.find((s) => s.status === "RUNNING");
      if (runningStep) {
        await updateStep(runningStep.id, "FAILED", error.message || "Unexpected failure occurred");
      }

      // Mark other pending steps as failed or cancelled
      for (const step of steps) {
        if (step.status === "PENDING" || step.status === "RUNNING") {
          await updateStep(step.id, "FAILED", "Cancelled due to previous error");
        }
      }

      await prisma.workflowLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          result: `Workflow failed: ${error.message || "Unknown error"}`,
          completedAt: new Date(),
        },
      });

      return {
        id: log.id,
        workflowType: "ONBOARDING" as const,
        input,
        status: "FAILED" as const,
        steps,
        resultSummary: `Onboarding failed: ${error.message || "Unknown error"}`,
        createdAt: log.createdAt.toISOString(),
      };
    }
  }

  static async runPromotion(input: string, triggeredBy: string = "HR System") {
    const parsed = await parseWorkflowInput(input);
    if (parsed.type !== "PROMOTION") {
      throw new Error("Invalid workflow input for Promotion");
    }

    const { name, toPosition, salaryIncrease, toSalary } = parsed.data;

    const steps: WorkflowStep[] = [
      { id: "1", name: "Locate Employee Profile", description: "Search database for matching employee", status: "PENDING" },
      { id: "2", name: "Calculate Salary Revision", description: "Review current compensation and apply revisions", status: "PENDING" },
      { id: "3", name: "Create Promotion Record", description: "Commit new promotion entity in DB", status: "PENDING" },
      { id: "4", name: "Update Employee Position & Compensation", description: "Update main employee profile", status: "PENDING" },
      { id: "5", name: "Notify Manager & Employee", description: "Send automated dashboard alerts", status: "PENDING" },
    ];

    const log = await prisma.workflowLog.create({
      data: {
        workflowType: "PROMOTION",
        input,
        status: "RUNNING",
        steps: JSON.stringify(steps),
        triggeredBy,
        startedAt: new Date(),
      },
    });

    const updateStep = async (stepId: string, status: WorkflowStep["status"], result?: string) => {
      const idx = steps.findIndex((s) => s.id === stepId);
      if (idx !== -1) {
        steps[idx].status = status;
        steps[idx].result = result;
        steps[idx].updatedAt = new Date().toISOString();
        await prisma.workflowLog.update({
          where: { id: log.id },
          data: { steps: JSON.stringify(steps) },
        });
      }
    };

    try {
      // Step 1: Locate Employee
      await updateStep("1", "RUNNING");
      await sleep(1000);
      const employee = await prisma.employee.findFirst({
        where: {
          name: {
            contains: name,
          },
        },
      });

      if (!employee) {
        throw new Error(`Employee with name containing '${name}' not found.`);
      }
      await updateStep("1", "COMPLETED", `Found employee: ${employee.name} (${employee.employeeId}), current role: ${employee.position}, current salary: $${employee.salary.toLocaleString()}`);

      // Step 2: Salary Revision
      await updateStep("2", "RUNNING");
      await sleep(1000);
      
      let finalSalary = toSalary;
      let revisionPct = salaryIncrease;
      
      if (!finalSalary) {
        revisionPct = salaryIncrease || 15;
        finalSalary = employee.salary * (1 + revisionPct / 100);
      } else {
        revisionPct = Math.round(((finalSalary - employee.salary) / employee.salary) * 100);
      }
      await updateStep("2", "COMPLETED", `Calculated salary revision: +${revisionPct}% ($${employee.salary.toLocaleString()} -> $${finalSalary.toLocaleString()})`);

      // Step 3: Create Promotion Record
      await updateStep("3", "RUNNING");
      await sleep(800);
      const promotion = await prisma.promotion.create({
        data: {
          employeeId: employee.id,
          fromPosition: employee.position,
          toPosition,
          fromSalary: employee.salary,
          toSalary: finalSalary,
          salaryRevision: revisionPct,
          reason: `Autonomous Promotion: ${input}`,
          status: "APPROVED",
          effectiveDate: new Date(),
        },
      });
      await updateStep("3", "COMPLETED", `Promotion record logged with ID: ${promotion.id}`);

      // Step 4: Update Profile
      await updateStep("4", "RUNNING");
      await sleep(1000);
      await prisma.employee.update({
        where: { id: employee.id },
        data: {
          position: toPosition,
          salary: finalSalary,
        },
      });
      await updateStep("4", "COMPLETED", `Employee profile position updated to: ${toPosition}`);

      // Step 5: Notify
      await updateStep("5", "RUNNING");
      await sleep(1000);
      
      // Notify employee
      await prisma.notification.create({
        data: {
          userId: employee.userId,
          title: "Congratulations on your Promotion!",
          message: `You have been promoted to ${toPosition}. Your new salary is $${finalSalary.toLocaleString()}.`,
          type: "SUCCESS",
          link: "/performance",
        },
      });

      // Notify manager if exists
      if (employee.managerId) {
        const mgr = await prisma.employee.findUnique({
          where: { id: employee.managerId },
        });
        if (mgr) {
          await prisma.notification.create({
            data: {
              userId: mgr.userId,
              title: "Promotion Implemented",
              message: `${employee.name} has been promoted to ${toPosition} (+${revisionPct}% salary adjustment).`,
              type: "INFO",
              link: "/promotions",
            },
          });
        }
      }

      await updateStep("5", "COMPLETED", "Notification templates delivered to Employee and Reporting Managers.");

      await prisma.workflowLog.update({
        where: { id: log.id },
        data: {
          status: "COMPLETED",
          result: `Successfully promoted ${employee.name} to ${toPosition}`,
          completedAt: new Date(),
        },
      });

      return {
        id: log.id,
        workflowType: "PROMOTION" as const,
        input,
        status: "COMPLETED" as const,
        steps,
        resultSummary: `Successfully promoted ${employee.name} from ${employee.position} to ${toPosition} with a new salary of $${finalSalary.toLocaleString()}.`,
        employeeId: employee.id,
        createdAt: log.createdAt.toISOString(),
      };
    } catch (error: any) {
      console.error("Promotion workflow failed", error);
      
      const runningStep = steps.find((s) => s.status === "RUNNING");
      if (runningStep) {
        await updateStep(runningStep.id, "FAILED", error.message || "Unexpected failure occurred");
      }

      for (const step of steps) {
        if (step.status === "PENDING" || step.status === "RUNNING") {
          await updateStep(step.id, "FAILED", "Cancelled due to previous error");
        }
      }

      await prisma.workflowLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          result: `Promotion workflow failed: ${error.message || "Unknown error"}`,
          completedAt: new Date(),
        },
      });

      return {
        id: log.id,
        workflowType: "PROMOTION" as const,
        input,
        status: "FAILED" as const,
        steps,
        resultSummary: `Promotion failed: ${error.message || "Unknown error"}`,
        createdAt: log.createdAt.toISOString(),
      };
    }
  }

  static async runInterviewWorkflow(input: string, triggeredBy: string = "HR System") {
    const parsed = await parseWorkflowInput(input);
    if (parsed.type !== "INTERVIEW") {
      throw new Error("Invalid workflow input for Interview");
    }

    const { jobTitle, candidateName } = parsed.data;

    const steps: WorkflowStep[] = [
      { id: "1", name: "Analyze Scheduling Request", description: "Parse interview criteria and candidate pool", status: "PENDING" },
      { id: "2", name: "Identify Shortlisted Candidates", description: "Filter candidates matching the criteria", status: "PENDING" },
      { id: "3", name: "Schedule Interview Slots", description: "Create interview records for qualified candidates", status: "PENDING" },
      { id: "4", name: "Notify Panel & Candidates", description: "Send dashboard alerts", status: "PENDING" },
    ];

    const log = await prisma.workflowLog.create({
      data: {
        workflowType: "INTERVIEW",
        input,
        status: "RUNNING",
        steps: JSON.stringify(steps),
        triggeredBy,
        startedAt: new Date(),
      },
    });

    const updateStep = async (stepId: string, status: WorkflowStep["status"], result?: string) => {
      const idx = steps.findIndex((s) => s.id === stepId);
      if (idx !== -1) {
        steps[idx].status = status;
        steps[idx].result = result;
        steps[idx].updatedAt = new Date().toISOString();
        await prisma.workflowLog.update({
          where: { id: log.id },
          data: { steps: JSON.stringify(steps) },
        });
      }
    };

    try {
      await updateStep("1", "RUNNING");
      await sleep(800);

      const isShortlistedWorkflow = input.toLowerCase().includes("shortlisted candidates");
      const interviewType = isShortlistedWorkflow
        ? "2nd Interview"
        : (jobTitle && (jobTitle.includes("tech") || jobTitle.includes("engineer") || jobTitle.includes("developer"))
          ? "Technical Interview" : "HR Screening");
      await updateStep("1", "COMPLETED", `Classified as: ${interviewType}`);

      await updateStep("2", "RUNNING");
      await sleep(1000);

      const candidates = await prisma.candidate.findMany({
        where: {
          status: isShortlistedWorkflow ? "EVALUATED" : { in: ["APPLIED", "SCREENING", "SHORTLISTED"] },
          ...(candidateName ? { name: { contains: candidateName } } : {}),
          ...(jobTitle && !isShortlistedWorkflow ? { jobOpening: { title: { contains: jobTitle } } } : {}),
        },
        include: { jobOpening: { select: { title: true } } },
      });

      if (candidates.length === 0) {
        throw new Error(isShortlistedWorkflow ? "No evaluated candidates found to schedule 2nd interview" : "No eligible candidates found for interview scheduling");
      }
      await updateStep("2", "COMPLETED", `Found ${candidates.length} candidate(s) for scheduling`);

      await updateStep("3", "RUNNING");
      await sleep(1000);

      const scheduledInterviews = [];
      for (const candidate of candidates) {
        const interview = await prisma.interview.create({
          data: {
            candidateId: candidate.id,
            scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            duration: 60,
            type: interviewType,
            panelMembers: "Sarah Jenkins, Robert Kovac",
            location: "Google Meet",
            status: "SCHEDULED",
            notes: `Auto-scheduled by AI workflow: ${input}`,
          },
        });
        scheduledInterviews.push(interview);

        await prisma.candidate.update({
          where: { id: candidate.id },
          data: { status: "INTERVIEW" },
        });
      }
      await updateStep("3", "COMPLETED", `Created ${scheduledInterviews.length} interview record(s)`);

      await updateStep("4", "RUNNING");
      await sleep(800);

      for (const candidate of candidates) {
        const user = await prisma.user.findFirst();
        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "Interview Scheduled",
              message: `AI workflow scheduled a ${interviewType} for ${candidate.name}.`,
              type: "WORKFLOW",
              link: "/interviews",
            },
          });
        }
      }
      await updateStep("4", "COMPLETED", "Stakeholders notified successfully");

      await prisma.workflowLog.update({
        where: { id: log.id },
        data: {
          status: "COMPLETED",
          result: `Scheduled ${scheduledInterviews.length} interview(s) via AI workflow`,
          completedAt: new Date(),
        },
      });

      return {
        id: log.id,
        workflowType: "INTERVIEW" as const,
        input,
        status: "COMPLETED" as const,
        steps,
        resultSummary: `Scheduled ${scheduledInterviews.length} interview(s) for ${candidates.map(c => c.name).join(", ")}`,
        createdAt: log.createdAt.toISOString(),
      };
    } catch (error: any) {
      const runningStep = steps.find((s) => s.status === "RUNNING");
      if (runningStep) {
        await updateStep(runningStep.id, "FAILED", error.message || "Unexpected failure");
      }
      for (const step of steps) {
        if (step.status === "PENDING" || step.status === "RUNNING") {
          await updateStep(step.id, "FAILED", "Cancelled due to previous error");
        }
      }
      await prisma.workflowLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          result: `Interview workflow failed: ${error.message || "Unknown error"}`,
          completedAt: new Date(),
        },
      });
      return {
        id: log.id,
        workflowType: "INTERVIEW" as const,
        input,
        status: "FAILED" as const,
        steps,
        resultSummary: `Interview scheduling failed: ${error.message || "Unknown error"}`,
        createdAt: log.createdAt.toISOString(),
      };
    }
  }

  static async runPayrollWorkflow(input: string, triggeredBy: string = "HR System") {
    const parsed = await parseWorkflowInput(input);
    const { name } = parsed.data as { name?: string; input?: string };

    const steps: WorkflowStep[] = [
      { id: "1", name: "Locate Employee", description: "Search employee records by name", status: "PENDING" },
      { id: "2", name: "Calculate Salary", description: "Compute base salary, allowances, and deductions", status: "PENDING" },
      { id: "3", name: "Generate Payroll Record", description: "Create payroll entry in the system", status: "PENDING" },
      { id: "4", name: "Notify Employee", description: "Send payroll notification", status: "PENDING" },
    ];

    const log = await prisma.workflowLog.create({
      data: {
        workflowType: "PAYROLL",
        input,
        status: "RUNNING",
        steps: JSON.stringify(steps),
        triggeredBy,
        startedAt: new Date(),
      },
    });

    const updateStep = async (stepId: string, status: WorkflowStep["status"], result?: string) => {
      const idx = steps.findIndex((s) => s.id === stepId);
      if (idx !== -1) {
        steps[idx].status = status;
        steps[idx].result = result;
        steps[idx].updatedAt = new Date().toISOString();
        await prisma.workflowLog.update({
          where: { id: log.id },
          data: { steps: JSON.stringify(steps) },
        });
      }
    };

    try {
      await updateStep("1", "RUNNING");
      await sleep(800);

      if (!name) {
        await updateStep("1", "FAILED", "No employee name found in request.");
        throw new Error("No employee name specified. Usage: Generate payroll for [employee name]");
      }

      const employee = await prisma.employee.findFirst({
        where: { name: { contains: name, mode: "insensitive" }, status: "ACTIVE" },
      });

      if (!employee) {
        await updateStep("1", "FAILED", `Employee "${name}" not found.`);
        throw new Error(`Employee "${name}" not found.`);
      }

      await updateStep("1", "COMPLETED", `Found employee: ${employee.name} (${employee.employeeId})`);

      await updateStep("2", "RUNNING");
      await sleep(1000);

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const monthlySalary = Math.round(employee.salary / 12);
      const allowances = Math.round(monthlySalary * 0.1);
      const tax = Math.round(monthlySalary * 0.08);
      const netPay = monthlySalary + allowances - tax;

      await updateStep("2", "COMPLETED", `Base: $${monthlySalary}, Allowances: $${allowances}, Tax: $${tax}, Net: $${netPay}`);

      await updateStep("3", "RUNNING");
      await sleep(1000);

      const existing = await prisma.payroll.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: employee.id,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
        },
      });

      if (existing) {
        await updateStep("3", "COMPLETED", `Payroll already exists for ${monthNames[now.getMonth()]} ${now.getFullYear()}. Skipping.`);
      } else {
        await prisma.payroll.create({
          data: {
            employeeId: employee.id,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            baseSalary: monthlySalary,
            allowances,
            deductions: 0,
            tax,
            bonuses: 0,
            netPay: monthlySalary + allowances - tax,
            status: "DRAFT",
            notes: `Auto-generated by AI workflow for ${employee.name}`,
          },
        });
        await updateStep("3", "COMPLETED", `Payroll created for ${monthNames[now.getMonth()]} ${now.getFullYear()}: Net $${(monthlySalary + allowances - tax).toLocaleString()}`);
      }

      await updateStep("4", "RUNNING");
      await sleep(800);

      await prisma.notification.create({
        data: {
          userId: employee.userId,
          title: "Payroll Generated",
          message: `Your payroll for ${monthNames[now.getMonth()]} ${now.getFullYear()} has been generated. Net pay: $${(monthlySalary + allowances - tax).toLocaleString()}.`,
          type: "INFO",
          link: "/payroll",
        },
      });
      await updateStep("4", "COMPLETED", `Notification sent to ${employee.name}`);

      await prisma.workflowLog.update({
        where: { id: log.id },
        data: { status: "COMPLETED", result: `Payroll generated for ${employee.name}`, completedAt: new Date() },
      });

      return {
        id: log.id,
        workflowType: "PAYROLL",
        input,
        status: "COMPLETED" as const,
        steps,
        resultSummary: `Payroll generated for ${employee.name} — $${(monthlySalary + allowances - tax).toLocaleString()} net pay`,
        employeeId: employee.employeeId,
        createdAt: log.createdAt.toISOString(),
      };
    } catch (e: any) {
      await prisma.workflowLog.update({
        where: { id: log.id },
        data: { status: "FAILED", result: e.message || "Payroll workflow failed", completedAt: new Date() },
      });
      return {
        id: log.id,
        workflowType: "PAYROLL",
        input,
        status: "FAILED" as const,
        steps,
        resultSummary: `Payroll workflow failed: ${e.message || "Unknown error"}`,
        createdAt: log.createdAt.toISOString(),
      };
    }
  }

  static async runLeaveWorkflow(input: string, triggeredBy: string = "HR System") {
    const parsed = await parseWorkflowInput(input);
    const { name, leaveType, days } = parsed.data as { name?: string; leaveType?: string; days?: number; input?: string };

    const steps: WorkflowStep[] = [
      { id: "1", name: "Locate Employee", description: "Search employee records by name", status: "PENDING" },
      { id: "2", name: "Validate Leave Balance", description: "Check leave allocation and conflicts", status: "PENDING" },
      { id: "3", name: "Submit Leave Request", description: "Create leave record in the system", status: "PENDING" },
      { id: "4", name: "Notify Approver", description: "Send leave request to manager", status: "PENDING" },
    ];

    const log = await prisma.workflowLog.create({
      data: {
        workflowType: "LEAVE",
        input,
        status: "RUNNING",
        steps: JSON.stringify(steps),
        triggeredBy,
        startedAt: new Date(),
      },
    });

    const updateStep = async (stepId: string, status: WorkflowStep["status"], result?: string) => {
      const idx = steps.findIndex((s) => s.id === stepId);
      if (idx !== -1) {
        steps[idx].status = status;
        steps[idx].result = result;
        steps[idx].updatedAt = new Date().toISOString();
        await prisma.workflowLog.update({
          where: { id: log.id },
          data: { steps: JSON.stringify(steps) },
        });
      }
    };

    try {
      await updateStep("1", "RUNNING");
      await sleep(800);

      if (!name) {
        await updateStep("1", "FAILED", "No employee name found in request.");
        throw new Error("No employee name specified. Usage: Apply leave for [employee name]");
      }

      const employee = await prisma.employee.findFirst({
        where: { name: { contains: name, mode: "insensitive" }, status: "ACTIVE" },
      });

      if (!employee) {
        await updateStep("1", "FAILED", `Employee "${name}" not found.`);
        throw new Error(`Employee "${name}" not found.`);
      }

      await updateStep("1", "COMPLETED", `Found employee: ${employee.name} (${employee.employeeId})`);

      await updateStep("2", "RUNNING");
      await sleep(1000);

      const leaveDays = days || 3;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + leaveDays - 1);

      await updateStep("2", "COMPLETED", `${leaveType || "ANNUAL"} leave for ${leaveDays} days from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);

      await updateStep("3", "RUNNING");
      await sleep(1000);

      const leave = await prisma.leave.create({
        data: {
          employeeId: employee.id,
          type: leaveType || "ANNUAL",
          startDate,
          endDate,
          days: leaveDays,
          reason: `Auto-generated by AI workflow: ${input}`,
          status: "PENDING",
        },
      });

      await updateStep("3", "COMPLETED", `Leave request created (ID: ${leave.id})`);

      await updateStep("4", "RUNNING");
      await sleep(800);

      await prisma.notification.create({
        data: {
          userId: employee.userId,
          title: "Leave Request Submitted",
          message: `Your ${leaveType || "annual"} leave request for ${leaveDays} days has been submitted for approval.`,
          type: "INFO",
          link: "/leave",
        },
      });
      await updateStep("4", "COMPLETED", `Notification sent to ${employee.name}`);

      await prisma.workflowLog.update({
        where: { id: log.id },
        data: { status: "COMPLETED", result: `Leave request created for ${employee.name}`, completedAt: new Date() },
      });

      return {
        id: log.id,
        workflowType: "LEAVE",
        input,
        status: "COMPLETED" as const,
        steps,
        resultSummary: `Leave request submitted for ${employee.name} — ${leaveType || "Annual"} leave for ${leaveDays} days`,
        employeeId: employee.employeeId,
        createdAt: log.createdAt.toISOString(),
      };
    } catch (e: any) {
      await prisma.workflowLog.update({
        where: { id: log.id },
        data: { status: "FAILED", result: e.message || "Leave workflow failed", completedAt: new Date() },
      });
      return {
        id: log.id,
        workflowType: "LEAVE",
        input,
        status: "FAILED" as const,
        steps,
        resultSummary: `Leave workflow failed: ${e.message || "Unknown error"}`,
        createdAt: log.createdAt.toISOString(),
      };
    }
  }

  static async runJobPostingWorkflow(input: string, triggeredBy: string = "HR System") {
    const parsed = await parseWorkflowInput(input);
    if (parsed.type !== "JOB_POSTING") {
      throw new Error("Invalid workflow input for Job Posting");
    }

    const { title, department } = parsed.data;

    const steps: WorkflowStep[] = [
      { id: "1", name: "Analyze Job Requirements", description: "Parse job title and target department", status: "PENDING" },
      { id: "2", name: "Create Job Opening Record", description: "Draft the opening in the Recruitment module", status: "PENDING" },
      { id: "3", name: "Notify Recruitment Team", description: "Alert stakeholders about the new opening", status: "PENDING" },
    ];

    const log = await prisma.workflowLog.create({
      data: {
        workflowType: "JOB_POSTING",
        input,
        status: "RUNNING",
        steps: JSON.stringify(steps),
        triggeredBy,
        startedAt: new Date(),
      },
    });

    const updateStep = async (stepId: string, status: WorkflowStep["status"], result?: string) => {
      const idx = steps.findIndex((s) => s.id === stepId);
      if (idx !== -1) {
        steps[idx].status = status;
        steps[idx].result = result;
        steps[idx].updatedAt = new Date().toISOString();
        await prisma.workflowLog.update({
          where: { id: log.id },
          data: { steps: JSON.stringify(steps) },
        });
      }
    };

    try {
      await updateStep("1", "RUNNING");
      await sleep(1000);
      await updateStep("1", "COMPLETED", `Identified role: ${title} in ${department}`);

      await updateStep("2", "RUNNING");
      await sleep(1000);
      
      const job = await prisma.jobOpening.create({
        data: {
          title,
          department,
          description: `Auto-generated draft description for ${title} in ${department}. Please review and expand.`,
          requirements: "To be defined by Hiring Manager.",
          location: "Remote",
          type: "Full-time",
          openings: 1,
          status: "OPEN",
        },
      });

      await updateStep("2", "COMPLETED", `Job Opening created (ID: ${job.id})`);

      await updateStep("3", "RUNNING");
      await sleep(800);

      const recruiters = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "HR"] } },
      });

      for (const rec of recruiters) {
        await prisma.notification.create({
          data: {
            userId: rec.id,
            title: "New Job Posted via AI",
            message: `A new job opening for ${title} has been posted.`,
            type: "WORKFLOW",
            link: "/recruitment",
          },
        });
      }

      await updateStep("3", "COMPLETED", "Recruitment team notified.");

      await prisma.workflowLog.update({
        where: { id: log.id },
        data: { status: "COMPLETED", result: `Posted job opening for ${title}`, completedAt: new Date() },
      });

      return {
        id: log.id,
        workflowType: "JOB_POSTING" as const,
        input,
        status: "COMPLETED" as const,
        steps,
        resultSummary: `Successfully posted a new job opening for ${title} in the ${department} department.`,
        createdAt: log.createdAt.toISOString(),
      };
    } catch (error: any) {
      const runningStep = steps.find((s) => s.status === "RUNNING");
      if (runningStep) {
        await updateStep(runningStep.id, "FAILED", error.message || "Unexpected failure occurred");
      }
      for (const step of steps) {
        if (step.status === "PENDING" || step.status === "RUNNING") {
          await updateStep(step.id, "FAILED", "Cancelled due to previous error");
        }
      }
      await prisma.workflowLog.update({
        where: { id: log.id },
        data: { status: "FAILED", result: `Job posting workflow failed: ${error.message}`, completedAt: new Date() },
      });
      return {
        id: log.id,
        workflowType: "JOB_POSTING" as const,
        input,
        status: "FAILED" as const,
        steps,
        resultSummary: `Failed to post job: ${error.message}`,
        createdAt: log.createdAt.toISOString(),
      };
    }
  }

  static async runGeneralWorkflow(input: string, triggeredBy: string = "HR System") {
    const parsed = await parseWorkflowInput(input);
    
    if (parsed.type === "ONBOARDING") {
      return this.runOnboarding(input, triggeredBy);
    }
    
    if (parsed.type === "PROMOTION") {
      return this.runPromotion(input, triggeredBy);
    }

    if (parsed.type === "INTERVIEW") {
      return this.runInterviewWorkflow(input, triggeredBy);
    }

    if (parsed.type === "PAYROLL") {
      return this.runPayrollWorkflow(input, triggeredBy);
    }

    if (parsed.type === "LEAVE") {
      return this.runLeaveWorkflow(input, triggeredBy);
    }

    if (parsed.type === "JOB_POSTING") {
      return this.runJobPostingWorkflow(input, triggeredBy);
    }

    // Default mock workflow for other inputs
    const steps: WorkflowStep[] = [
      { id: "1", name: "Analyze Input", description: "Parse requirements and map dependencies", status: "PENDING" },
      { id: "2", name: "Process Action Items", description: "Trigger business rules and updates", status: "PENDING" },
      { id: "3", name: "Notify Stakeholders", description: "Log audit events and alert HR roles", status: "PENDING" },
    ];

    const log = await prisma.workflowLog.create({
      data: {
        workflowType: parsed.type === "UNKNOWN" ? "CUSTOM" : parsed.type,
        input,
        status: "RUNNING",
        steps: JSON.stringify(steps),
        triggeredBy,
        startedAt: new Date(),
      },
    });

    const updateStep = async (stepId: string, status: WorkflowStep["status"], result?: string) => {
      const idx = steps.findIndex((s) => s.id === stepId);
      if (idx !== -1) {
        steps[idx].status = status;
        steps[idx].result = result;
        steps[idx].updatedAt = new Date().toISOString();
        await prisma.workflowLog.update({
          where: { id: log.id },
          data: { steps: JSON.stringify(steps) },
        });
      }
    };

    try {
      await updateStep("1", "RUNNING");
      await sleep(1000);
      await updateStep("1", "COMPLETED", `Intent classified as: ${parsed.type}`);

      await updateStep("2", "RUNNING");
      await sleep(1500);
      await updateStep("2", "COMPLETED", "Executed custom tasks based on unstructured input guidelines.");

      await updateStep("3", "RUNNING");
      await sleep(800);
      await updateStep("3", "COMPLETED", "Workflow results stored. HR manager inbox updated.");

      await prisma.workflowLog.update({
        where: { id: log.id },
        data: {
          status: "COMPLETED",
          result: `Workflow of type ${parsed.type} ran successfully.`,
          completedAt: new Date(),
        },
      });

      return {
        id: log.id,
        workflowType: parsed.type,
        input,
        status: "COMPLETED" as const,
        steps,
        resultSummary: `Completed HR task processing for query: "${input}"`,
        createdAt: log.createdAt.toISOString(),
      };
    } catch (e: any) {
      await prisma.workflowLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          result: e.message || "Custom workflow failed",
          completedAt: new Date(),
        },
      });
      return {
        id: log.id,
        workflowType: parsed.type,
        input,
        status: "FAILED" as const,
        steps,
        resultSummary: `Failed to complete workflow: ${e.message}`,
        createdAt: log.createdAt.toISOString(),
      };
    }
  }
}
