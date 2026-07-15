import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Clear existing database entries
  await prisma.workflowLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.exitProcess.deleteMany({});
  await prisma.recognition.deleteMany({});
  await prisma.engagementFeedback.deleteMany({});
  await prisma.engagementSurvey.deleteMany({});
  await prisma.promotion.deleteMany({});
  await prisma.performanceReview.deleteMany({});
  await prisma.leave.deleteMany({});
  await prisma.payroll.deleteMany({});
  await prisma.trainingAssignment.deleteMany({});
  await prisma.training.deleteMany({});
  await prisma.onboarding.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.evaluation.deleteMany({});
  await prisma.interview.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.jobOpening.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Cleared database.");

  // 2. Helper to hash per-user passwords
  const passwordFor = async (name: string) => {
    const plain = name.toLowerCase().replace(/\s+/g, "") + "123";
    return bcrypt.hash(plain, 10);
  };

  // 3. Create core Users (Admin, HR, Manager, Employee)
  const userAdmin = await prisma.user.create({
    data: {
      email: "admin@aihr.com",
      password: await passwordFor("Marcus Aurelius"),
      name: "Marcus Aurelius",
      role: "ADMIN",
    },
  });

  const userHR = await prisma.user.create({
    data: {
      email: "hr@aihr.com",
      password: await passwordFor("Sarah Jenkins"),
      name: "Sarah Jenkins",
      role: "HR",
    },
  });

  const userManager = await prisma.user.create({
    data: {
      email: "manager@aihr.com",
      password: await passwordFor("Robert Kovac"),
      name: "Robert Kovac",
      role: "MANAGER",
    },
  });

  const userEmployee = await prisma.user.create({
    data: {
      email: "employee@aihr.com",
      password: await passwordFor("Emma Watson"),
      name: "Emma Watson",
      role: "EMPLOYEE",
    },
  });

  console.log("Created credential user accounts.");

  // 4. Create Employee Profiles for core users
  const empHR = await prisma.employee.create({
    data: {
      userId: userHR.id,
      employeeId: "EMP-001",
      name: "Sarah Jenkins",
      email: "sarah.jenkins@aihr.com",
      companyEmail: "sarah.jenkins@aihr.com",
      phone: "+1 (555) 019-2831",
      gender: "Female",
      department: "HR",
      position: "Head of People Operations",
      salary: 115000,
      status: "ACTIVE",
    },
  });

  const empManager = await prisma.employee.create({
    data: {
      userId: userManager.id,
      employeeId: "EMP-002",
      name: "Robert Kovac",
      email: "robert.kovac@aihr.com",
      companyEmail: "robert.kovac@aihr.com",
      phone: "+1 (555) 012-3456",
      gender: "Male",
      department: "Engineering",
      position: "Engineering Director",
      salary: 165000,
      status: "ACTIVE",
    },
  });

  const empEmployee = await prisma.employee.create({
    data: {
      userId: userEmployee.id,
      employeeId: "EMP-003",
      name: "Emma Watson",
      email: "emma.watson@aihr.com",
      companyEmail: "emma.watson@aihr.com",
      phone: "+1 (555) 014-9876",
      gender: "Female",
      department: "Marketing",
      position: "Marketing Coordinator",
      salary: 68000,
      status: "ACTIVE",
      managerId: empHR.id, // Sarah is HR manager
    },
  });

  // Assign Emma's manager to Sarah
  await prisma.employee.update({
    where: { id: empEmployee.id },
    data: { managerId: empHR.id },
  });

  console.log("Linked core employee profile structures.");

  // 5. Generate 15 extra employees to populate the database
  const departments = ["Engineering", "Design", "Marketing", "Sales", "HR", "Finance"];
  const positions = {
    Engineering: ["Staff Engineer", "Software Engineer II", "Frontend Engineer", "DevOps Specialist"],
    Design: ["Senior UI/UX Designer", "Product Designer"],
    Marketing: ["Growth Lead", "SEO Analyst", "Content Writer"],
    Sales: ["Account Executive", "Sales Specialist"],
    HR: ["Recruiting Coordinator", "HR Generalist"],
    Finance: ["Senior Accountant", "Financial Analyst"],
  };

  const names = [
    "Liam Neeson", "Noah Centineo", "Oliver Jackson", "Elijah Wood", "James McAvoy",
    "Sophia Loren", "Isabella Rossellini", "Mia Farrow", "Charlotte Gainsbourg", "Amelia Earhart",
    "Benjamin Franklin", "Lucas Hedges", "Henry Cavill", "Alexander Skarsgard", "Sebastian Stan"
  ];

  const generatedEmployees = [];

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const dept = departments[i % departments.length];
    const posList = positions[dept as keyof typeof positions];
    const pos = posList[i % posList.length];
    const salary = 60000 + (i * 8000);
    const empId = `EMP-00${i + 4}`;

    // Create user login credential first
    const emailPrefix = name.toLowerCase().replace(/\s+/g, "");
    const companyEmail = `${emailPrefix}@aihr.com`;

    const user = await prisma.user.create({
      data: {
        email: companyEmail,
        password: await passwordFor(name),
        name,
        role: "EMPLOYEE",
      },
    });

    const genders = ["Male", "Female", "Other"];
    const emp = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeId: empId,
        name,
        email: companyEmail,
        companyEmail,
        phone: `+1 (555) 018-${String(2000 + i * 27)}`,
        gender: genders[i % genders.length],
        department: dept,
        position: pos,
        salary,
        status: i === 12 ? "ON_LEAVE" : "ACTIVE",
        managerId: dept === "Engineering" ? empManager.id : empHR.id,
        joinDate: new Date(2024, i % 12, (i * 2) % 28 + 1),
      },
    });

    generatedEmployees.push(emp);
  }

  console.log(`Generated ${generatedEmployees.length} employee database profiles.`);

  // 6. Job Openings
  const job1 = await prisma.jobOpening.create({
    data: {
      title: "Senior Fullstack Engineer (Next.js)",
      department: "Engineering",
      description: "Build robust full-stack features using Next.js 15 App Router, React Server Components, and SQLite.",
      requirements: "5+ years JS experience, React expertise, DB modeling, and system architectures.",
      location: "Remote",
      type: "Full-time",
      salaryMin: 120000,
      salaryMax: 160000,
      openings: 2,
      status: "OPEN",
    },
  });

  const job2 = await prisma.jobOpening.create({
    data: {
      title: "Lead UI/UX Product Designer",
      department: "Design",
      description: "Design state-of-the-art SaaS web platform workflows, glassmorphism dashboards, and vector palettes.",
      requirements: "Figma master, portfolio of enterprise SaaS dashboards, micro-interaction setups.",
      location: "New York, NY",
      type: "Full-time",
      salaryMin: 110000,
      salaryMax: 140000,
      openings: 1,
      status: "OPEN",
    },
  });

  const job3 = await prisma.jobOpening.create({
    data: {
      title: "HR Specialist",
      department: "HR",
      description: "Administer employee benefit cycles, onboarding campaigns, and autonomous payroll systems.",
      requirements: "PHR credentials, experience running enterprise payroll integrations.",
      location: "Remote",
      type: "Full-time",
      salaryMin: 70000,
      salaryMax: 85000,
      openings: 1,
      status: "ON_HOLD",
    },
  });

  console.log("Created job openings catalog.");

  // 7. Candidates
  const cand1 = await prisma.candidate.create({
    data: {
      name: "Alice Johnson",
      email: "alice.j@gmail.com",
      phone: "+1 (555) 321-4567",
      experience: 6,
      skills: "React, Next.js, TypeScript, SQL, Node, AWS",
      status: "SCREENING",
      aiScreenScore: 88,
      jobOpeningId: job1.id,
      notes: "Highly qualified applicant. Fits tech stacks perfectly.",
    },
  });

  const cand2 = await prisma.candidate.create({
    data: {
      name: "Bob Carter",
      email: "bob.carter@outlook.com",
      phone: "+1 (555) 765-4321",
      experience: 4,
      skills: "Figma, Sketch, Adobe XD, CSS, prototyping",
      status: "INTERVIEW",
      aiScreenScore: 78,
      jobOpeningId: job2.id,
      notes: "Strong portfolio of dashboard wireframes.",
    },
  });

  const cand3 = await prisma.candidate.create({
    data: {
      name: "Clara Oswald",
      email: "clara.o@yahoo.com",
      phone: "+1 (555) 987-6543",
      experience: 2,
      skills: "HTML, CSS, basic Javascript, Figma",
      status: "REJECTED",
      aiScreenScore: 42,
      jobOpeningId: job2.id,
      notes: "Insufficient technical experience for senior designer role.",
    },
  });

  const cand4 = await prisma.candidate.create({
    data: {
      name: "Daniel Craig",
      email: "daniel.craig@gmail.com",
      phone: "+1 (555) 456-7890",
      experience: 8,
      skills: "Next.js, Node.js, Prisma, PostgreSQL, Docker, Kubernetes",
      status: "OFFERED",
      aiScreenScore: 92,
      jobOpeningId: job1.id,
      notes: "Strong system designs. Ideal fit.",
    },
  });

  console.log("Created candidates profile database.");

  // 8. Interview
  await prisma.interview.create({
    data: {
      candidateId: cand2.id,
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
      duration: 60,
      type: "Technical Portfolio Review",
      panelMembers: "Sarah Jenkins, Robert Kovac",
      location: "Google Meet Link: meet.google.com/abc-def-ghi",
      status: "SCHEDULED",
    },
  });

  // 9. Evaluation
  await prisma.evaluation.create({
    data: {
      candidateId: cand4.id,
      technicalScore: 9.5,
      hrScore: 9.0,
      communicationScore: 8.5,
      culturalFitScore: 9.0,
      overallScore: 9.0,
      recommendation: "STRONG_HIRE",
      aiSummary: "AI evaluation suggests Daniel Craig has exceptional architecture knowledge, scoring 9.5/10 technically. Behavioral review shows outstanding communication and team fit. Recommending immediate offer.",
      evaluatorNotes: "Outstanding tech skills. Explained caching strategies beautifully.",
    },
  });

  // 10. Offer
  await prisma.offer.create({
    data: {
      candidateId: cand4.id,
      salary: 135000,
      joiningDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks from now
      department: "Engineering",
      position: "Senior Fullstack Engineer (Next.js)",
      status: "SENT",
    },
  });

  // 11. Trainings
  const t1 = await prisma.training.create({
    data: {
      title: "SaaS Enterprise Compliance",
      description: "General business standards, legal, and anti-harassment",
      category: "Compliance",
      duration: 2,
      mandatory: true,
    },
  });

  const t2 = await prisma.training.create({
    data: {
      title: "Information Security & Cybersecurity Awareness",
      description: "Handling data, phishing protection, and devices security",
      category: "Compliance",
      duration: 3,
      mandatory: true,
    },
  });

  // Assign to Emma
  await prisma.trainingAssignment.create({
    data: {
      employeeId: empEmployee.id,
      trainingId: t1.id,
      status: "IN_PROGRESS",
      progress: 60,
      startedAt: new Date(),
    },
  });

  await prisma.trainingAssignment.create({
    data: {
      employeeId: empEmployee.id,
      trainingId: t2.id,
      status: "COMPLETED",
      progress: 100,
      startedAt: new Date(),
      completedAt: new Date(),
      certificateUrl: `/certificates/cert_t2_${empEmployee.id}.pdf`,
    },
  });

  console.log("Created training catalogs and assigned initial courses.");

  // 12. Leaves
  await prisma.leave.create({
    data: {
      employeeId: empEmployee.id,
      type: "SICK",
      startDate: new Date(2526, 5, 10),
      endDate: new Date(2526, 5, 11),
      days: 2,
      reason: "Flu symptoms",
      status: "APPROVED",
      approvedBy: "Sarah Jenkins",
      approvedAt: new Date(),
    },
  });

  await prisma.leave.create({
    data: {
      employeeId: empEmployee.id,
      type: "ANNUAL",
      startDate: new Date(2526, 7, 20),
      endDate: new Date(2526, 7, 24),
      days: 5,
      reason: "Family summer trip",
      status: "PENDING",
    },
  });

  console.log("Created leave requests.");

  // 13. Payrolls (Emma, Sarah, Robert)
  const months = [1, 2, 3, 4, 5, 6];
  for (const m of months) {
    // Emma
    await prisma.payroll.create({
      data: {
        employeeId: empEmployee.id,
        month: m,
        year: 2026,
        baseSalary: 5666, // 68000 / 12
        allowances: 200,
        deductions: 100,
        tax: 800,
        bonuses: m === 6 ? 500 : 0, // mid year bonus
        netPay: 5666 + 200 + (m === 6 ? 500 : 0) - 100 - 800,
        status: "PAID",
        paidAt: new Date(2026, m - 1, 28),
      },
    });

    // Sarah
    await prisma.payroll.create({
      data: {
        employeeId: empHR.id,
        month: m,
        year: 2026,
        baseSalary: 9583, // 115000 / 12
        allowances: 300,
        deductions: 150,
        tax: 1500,
        bonuses: 0,
        netPay: 9583 + 300 - 150 - 1500,
        status: "PAID",
        paidAt: new Date(2026, m - 1, 28),
      },
    });

    // Robert
    await prisma.payroll.create({
      data: {
        employeeId: empManager.id,
        month: m,
        year: 2026,
        baseSalary: 13750, // 165000 / 12
        allowances: 400,
        deductions: 200,
        tax: 2200,
        bonuses: m === 6 ? 2000 : 0,
        netPay: 13750 + 400 + (m === 6 ? 2000 : 0) - 200 - 2200,
        status: "PAID",
        paidAt: new Date(2026, m - 1, 28),
      },
    });
  }

  console.log("Populated employee payroll histories (6 months).");

  // 14. Performance Review
  await prisma.performanceReview.create({
    data: {
      employeeId: empEmployee.id,
      quarter: 1,
      year: 2026,
      rating: 4.2,
      feedback: "Emma has done a stellar job executing the Q1 product launch. Communication is clear and reports are generated on schedule.",
      goals: JSON.stringify(["Complete HubSpot certification", "Improve click-through ratios by 15%"]),
      achievements: JSON.stringify(["Launched Q1 campaign", "Automated newsletters"]),
      areasOfImprovement: "Deepen analytical analysis of SEO parameters.",
      aiSuggestions: "1. Enroll in Advanced Skill Training / Technical Leadership courses.\n2. Encourage cross-departmental product collaboration.\n3. Re-align next quarter goals to push project limits.",
      reviewedBy: "Sarah Jenkins",
      status: "COMPLETED",
    },
  });

  // 15. Promotions
  await prisma.promotion.create({
    data: {
      employeeId: empEmployee.id,
      fromPosition: "Marketing Intern",
      toPosition: "Marketing Coordinator",
      fromSalary: 55000,
      toSalary: 68000,
      salaryRevision: 23,
      reason: "Outstanding achievements during intern program.",
      status: "IMPLEMENTED",
      effectiveDate: new Date(2025, 11, 1),
    },
  });

  // 16. Surveys
  const survey = await prisma.engagementSurvey.create({
    data: {
      title: "Q2 Company Workplace Survey",
      description: "Gather feedback regarding work tools, management, and office schedules.",
      questions: JSON.stringify([
        "Rate your current tools (1-5)",
        "Rate leadership transparency (1-5)",
        "Would you recommend AI HR Employee to a friend? (Yes/No)",
      ]),
      status: "ACTIVE",
    },
  });

  await prisma.engagementFeedback.create({
    data: {
      employeeId: empEmployee.id,
      surveyId: survey.id,
      rating: 4.5,
      comments: "Really love the flexible remote culture and tools automation.",
      responses: JSON.stringify({
        "Rate your current tools (1-5)": "4",
        "Rate leadership transparency (1-5)": "5",
        "Would you recommend AI HR Employee to a friend? (Yes/No)": "Yes",
      }),
    },
  });

  // 17. Recognitions
  await prisma.recognition.create({
    data: {
      employeeId: empEmployee.id,
      title: "Value Champion: Innovation",
      description: "For automating Q1 campaign newsletters saving 5 hours weekly.",
      category: "Innovation",
      points: 150,
      awardedBy: "Sarah Jenkins",
    },
  });

  // 18. Notifications
  await prisma.notification.create({
    data: {
      userId: userHR.id,
      title: "New Candidate Applied",
      message: "Alice Johnson applied for 'Senior Fullstack Engineer (Next.js)' with AI Screen score 88.",
      type: "INFO",
      link: "/recruitment",
    },
  });

  await prisma.notification.create({
    data: {
      userId: userHR.id,
      title: "Leave Request Submitted",
      message: "Emma Watson has requested 5 days of Annual leave for July.",
      type: "WARNING",
      link: "/leave",
    },
  });

  // 19. Workflow Log (Onboarding sample)
  const steps = [
    { name: "Create Employee Profile", description: "Initialize profile in database", status: "COMPLETED", result: "Completed" },
    { name: "Generate Employee ID", description: "Allocate unique business identifier", status: "COMPLETED", result: "Assigned ID: EMP-003" },
    { name: "Generate Company Email", description: "Register @aihr.com active directory address", status: "COMPLETED", result: "emma.watson@aihr.com" },
    { name: "Assign Onboarding Checklist", description: "Activate week-1 tasks checklist", status: "COMPLETED", result: "Checklist uploaded" },
    { name: "Notify HR", description: "Send dashboard notifications", status: "COMPLETED", result: "Delivered alert" },
  ];

  await prisma.workflowLog.create({
    data: {
      workflowType: "ONBOARDING",
      input: "A new employee Emma Watson joined as Marketing Coordinator.",
      steps: JSON.stringify(steps),
      status: "COMPLETED",
      result: "Successfully onboarded employee Emma Watson (EMP-003)",
      triggeredBy: "Sarah Jenkins",
      startedAt: new Date(2026, 4, 15),
      completedAt: new Date(2026, 4, 15),
    },
  });

  console.log("Seeding database completed successfully!");
  prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    prisma.$disconnect();
    process.exit(1);
  });
