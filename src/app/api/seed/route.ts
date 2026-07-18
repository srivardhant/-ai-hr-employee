import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const existing = await prisma.employee.count();
    if (existing > 1) {
      return NextResponse.json({ message: `Database already seeded (${existing} employees). Nothing changed.` });
    }

    // ─────────────────────────────────────────
    // 1. ENSURE ADMIN: Srivardhan (existing user)
    // ─────────────────────────────────────────
    await prisma.employee.updateMany({
      where: { name: "Srivardhan" },
      data: { salary: 350000, position: "HR Director", department: "HR" },
    });
    const adminEmp = await prisma.employee.findFirst({ where: { name: "Srivardhan" } });

    // ─────────────────────────────────────────
    // 2. EMPLOYEES — 10 rich profiles
    // ─────────────────────────────────────────
    const employeeData = [
      { name: "Srikar",     email: "srikar@aihr.com",     role: "MANAGER",  gender: "Male",   dept: "Engineering",  pos: "Engineering Manager",     salary: 280000, phone: "9876543210", joinDate: "2023-01-15" },
      { name: "Yuvan",      email: "yuvan@aihr.com",      role: "EMPLOYEE", gender: "Male",   dept: "Engineering",  pos: "Senior Software Engineer", salary: 145000, phone: "9876543211", joinDate: "2023-03-10" },
      { name: "Hemanth",    email: "hemanth@aihr.com",    role: "EMPLOYEE", gender: "Male",   dept: "Engineering",  pos: "Software Engineer",        salary: 115000, phone: "9876543212", joinDate: "2023-06-01" },
      { name: "Srivally",   email: "srivally@aihr.com",   role: "EMPLOYEE", gender: "Female", dept: "Design",       pos: "Lead UI/UX Designer",      salary: 130000, phone: "9876543213", joinDate: "2023-02-20" },
      { name: "Srujana",    email: "srujana@aihr.com",    role: "EMPLOYEE", gender: "Female", dept: "Marketing",    pos: "Marketing Manager",        salary: 125000, phone: "9876543214", joinDate: "2023-04-05" },
      { name: "Rahul",      email: "rahul@aihr.com",      role: "EMPLOYEE", gender: "Male",   dept: "Sales",        pos: "Senior Sales Executive",   salary: 110000, phone: "9876543215", joinDate: "2023-05-15" },
      { name: "Ananya",     email: "ananya@aihr.com",     role: "EMPLOYEE", gender: "Female", dept: "Engineering",  pos: "QA Engineer",              salary: 105000, phone: "9876543216", joinDate: "2023-07-01" },
      { name: "Karthik",    email: "karthik@aihr.com",    role: "EMPLOYEE", gender: "Male",   dept: "Finance",      pos: "Finance Analyst",          salary: 120000, phone: "9876543217", joinDate: "2023-08-10" },
      { name: "Divya",      email: "divya@aihr.com",      role: "EMPLOYEE", gender: "Female", dept: "HR",           pos: "HR Specialist",            salary: 100000, phone: "9876543218", joinDate: "2023-09-01" },
      { name: "Vikram",     email: "vikram@aihr.com",     role: "MANAGER",  gender: "Male",   dept: "Sales",        pos: "Sales Manager",            salary: 200000, phone: "9876543219", joinDate: "2022-11-01" },
    ];

    const createdEmployees: Record<string, any> = {};
    let empIndex = 2;

    // Find the engineering manager (Srikar) to be manager of engineers
    let srikarEmp = await prisma.employee.findFirst({ where: { name: "Srikar" } });
    let vikramEmp = await prisma.employee.findFirst({ where: { name: "Vikram" } });

    for (const emp of employeeData) {
      let existing = await prisma.employee.findFirst({ where: { name: emp.name } });
      if (!existing) {
        await prisma.user.deleteMany({ where: { email: emp.email } });
        const user = await prisma.user.create({
          data: {
            email: emp.email,
            password: await bcrypt.hash(emp.name.toLowerCase() + "123", 10),
            name: emp.name,
            role: emp.role,
          },
        });
        existing = await prisma.employee.create({
          data: {
            userId: user.id,
            employeeId: `EMP-${String(empIndex).padStart(3, "0")}`,
            name: emp.name,
            email: emp.email,
            companyEmail: emp.email,
            phone: emp.phone,
            gender: emp.gender,
            department: emp.dept,
            position: emp.pos,
            salary: emp.salary,
            status: "ACTIVE",
            joinDate: new Date(emp.joinDate),
          },
        });
        empIndex++;
      }
      createdEmployees[emp.name] = existing;

      if (emp.name === "Srikar") srikarEmp = existing;
      if (emp.name === "Vikram") vikramEmp = existing;
    }

    // Set manager relationships
    if (srikarEmp && adminEmp) {
      await prisma.employee.update({ where: { id: srikarEmp.id }, data: { managerId: adminEmp.id } });
    }
    for (const name of ["Yuvan", "Hemanth", "Ananya"]) {
      const e = createdEmployees[name];
      if (e && srikarEmp) await prisma.employee.update({ where: { id: e.id }, data: { managerId: srikarEmp.id } });
    }
    for (const name of ["Rahul"]) {
      const e = createdEmployees[name];
      if (e && vikramEmp) await prisma.employee.update({ where: { id: e.id }, data: { managerId: vikramEmp.id } });
    }

    // ─────────────────────────────────────────
    // 3. JOB OPENINGS — 5 active roles
    // ─────────────────────────────────────────
    const jobOpenings: Record<string, any> = {};
    const jobData = [
      {
        key: "swe",
        title: "Senior Software Engineer",
        department: "Engineering",
        description: "Build scalable backend systems and APIs for our AI HR platform.",
        requirements: "5+ years Go/Node.js, PostgreSQL, REST APIs, system design",
        location: "Hyderabad / Remote",
        type: "Full-time",
        salaryMin: 150000,
        salaryMax: 250000,
        openings: 2,
      },
      {
        key: "design",
        title: "Product Designer",
        department: "Design",
        description: "Design beautiful, intuitive product experiences from wireframe to pixel-perfect delivery.",
        requirements: "3+ years Figma, UX research, design systems, prototyping",
        location: "Remote",
        type: "Full-time",
        salaryMin: 120000,
        salaryMax: 180000,
        openings: 1,
      },
      {
        key: "mktg",
        title: "Digital Marketing Specialist",
        department: "Marketing",
        description: "Drive growth through SEO, content, paid campaigns, and brand storytelling.",
        requirements: "2+ years digital marketing, Google Ads, SEO/SEM, analytics",
        location: "Hyderabad",
        type: "Full-time",
        salaryMin: 80000,
        salaryMax: 130000,
        openings: 1,
      },
      {
        key: "sales",
        title: "Enterprise Sales Executive",
        department: "Sales",
        description: "Identify and close enterprise SaaS deals with HR decision-makers.",
        requirements: "3+ years B2B SaaS sales, strong communication, CRM tools",
        location: "Remote",
        type: "Full-time",
        salaryMin: 100000,
        salaryMax: 160000,
        openings: 2,
      },
      {
        key: "qa",
        title: "QA Automation Engineer",
        department: "Engineering",
        description: "Build and maintain automated test suites for our product.",
        requirements: "2+ years Playwright/Cypress, TypeScript, CI/CD pipelines",
        location: "Hyderabad / Remote",
        type: "Full-time",
        salaryMin: 90000,
        salaryMax: 140000,
        openings: 1,
      },
    ];

    for (const jd of jobData) {
      let job = await prisma.jobOpening.findFirst({ where: { title: jd.title } });
      if (!job) {
        job = await prisma.jobOpening.create({
          data: {
            title: jd.title,
            department: jd.department,
            description: jd.description,
            requirements: jd.requirements,
            location: jd.location,
            type: jd.type,
            salaryMin: jd.salaryMin,
            salaryMax: jd.salaryMax,
            openings: jd.openings,
            status: "OPEN",
          },
        });
      }
      jobOpenings[jd.key] = job;
    }

    // ─────────────────────────────────────────
    // 4. CANDIDATES — 12 realistic profiles
    // ─────────────────────────────────────────
    const candidateData = [
      { name: "Srinivas Rao",     email: "srinivas.rao@gmail.com",     phone: "9100000001", exp: 6,  skills: "Go, PostgreSQL, Kubernetes, REST APIs",   status: "SHORTLISTED", aiScore: 87.5, jobKey: "swe",    source: "LinkedIn" },
      { name: "Ramesh Babu",      email: "ramesh.babu@gmail.com",      phone: "9100000002", exp: 4,  skills: "Node.js, MongoDB, React, TypeScript",     status: "INTERVIEW",   aiScore: 79.0, jobKey: "swe",    source: "Website" },
      { name: "Priya Sharma",     email: "priya.sharma@gmail.com",     phone: "9100000003", exp: 3,  skills: "Figma, UX research, Prototyping, Design Systems", status: "INTERVIEW", aiScore: 91.0, jobKey: "design", source: "LinkedIn" },
      { name: "Varshitha Reddy",  email: "varshitha.reddy@gmail.com",  phone: "9100000004", exp: 2,  skills: "Figma, Sketch, Adobe XD, Wireframing",   status: "SCREENING",   aiScore: 68.0, jobKey: "design", source: "Referral" },
      { name: "Mahender Goud",    email: "mahender.goud@gmail.com",    phone: "9100000005", exp: 5,  skills: "Google Ads, SEO, Content Marketing, HubSpot", status: "SHORTLISTED", aiScore: 82.0, jobKey: "mktg",  source: "LinkedIn" },
      { name: "Ananya Verma",     email: "ananya.verma@gmail.com",     phone: "9100000006", exp: 1,  skills: "Social Media, Canva, Google Analytics",  status: "APPLIED",     aiScore: 55.0, jobKey: "mktg",  source: "Website" },
      { name: "Suresh Kumar",     email: "suresh.kumar@gmail.com",     phone: "9100000007", exp: 4,  skills: "SaaS Sales, Salesforce, Negotiation, B2B", status: "OFFERED",    aiScore: 88.5, jobKey: "sales", source: "Referral" },
      { name: "Rama Krishnan",    email: "rama.krishnan@gmail.com",    phone: "9100000008", exp: 3,  skills: "Inside Sales, CRM, Outbound, Demo",       status: "INTERVIEW",   aiScore: 74.0, jobKey: "sales", source: "LinkedIn" },
      { name: "Nikhil Joshi",     email: "nikhil.joshi@gmail.com",     phone: "9100000009", exp: 5,  skills: "Playwright, Cypress, TypeScript, CI/CD",  status: "EVALUATED",   aiScore: 86.0, jobKey: "qa",    source: "Website" },
      { name: "Kavitha Nair",     email: "kavitha.nair@gmail.com",     phone: "9100000010", exp: 2,  skills: "Selenium, Java, TestNG, JIRA",            status: "SCREENING",   aiScore: 64.0, jobKey: "qa",    source: "LinkedIn" },
      { name: "Rohit Mehta",      email: "rohit.mehta@gmail.com",      phone: "9100000011", exp: 7,  skills: "Go, Microservices, AWS, gRPC",            status: "REJECTED",    aiScore: 42.0, jobKey: "swe",   source: "Website" },
      { name: "Deepika Singh",    email: "deepika.singh@gmail.com",    phone: "9100000012", exp: 4,  skills: "Python, FastAPI, Docker, PostgreSQL",     status: "APPLIED",     aiScore: 73.0, jobKey: "swe",   source: "LinkedIn" },
    ];

    const createdCandidates: any[] = [];
    for (const c of candidateData) {
      let cand = await prisma.candidate.findFirst({ where: { email: c.email } });
      if (!cand) {
        cand = await prisma.candidate.create({
          data: {
            name: c.name,
            email: c.email,
            phone: c.phone,
            experience: c.exp,
            skills: c.skills,
            status: c.status,
            aiScreenScore: c.aiScore,
            jobOpeningId: jobOpenings[c.jobKey]?.id || null,
            source: c.source,
          },
        });
      }
      createdCandidates.push({ ...cand, status: c.status });
    }

    // ─────────────────────────────────────────
    // 5. INTERVIEWS — for candidates in interview stage
    // ─────────────────────────────────────────
    const interviewCandidates = createdCandidates.filter((c) =>
      ["INTERVIEW", "EVALUATED", "SHORTLISTED"].includes(c.status)
    );
    const interviewTypes = ["HR Screening", "Technical Interview", "Cultural Review", "Final Director Review"];
    let iIdx = 0;
    for (const c of interviewCandidates) {
      const existing = await prisma.interview.findFirst({ where: { candidateId: c.id } });
      if (!existing) {
        const daysOffset = (iIdx % 5) + 2; // 2 to 6 days from now
        const scheduledAt = new Date();
        scheduledAt.setDate(scheduledAt.getDate() + daysOffset);
        scheduledAt.setHours(10 + iIdx * 2, 0, 0, 0);
        await prisma.interview.create({
          data: {
            candidateId: c.id,
            scheduledAt,
            duration: [45, 60, 60, 90][iIdx % 4],
            type: interviewTypes[iIdx % 4],
            status: "SCHEDULED",
            panelMembers: iIdx % 2 === 0 ? "Srikar, Srivardhan" : "Vikram, Srivardhan",
            calendarSyncStatus: "PENDING",
          },
        });
        iIdx++;
      }
    }

    // ─────────────────────────────────────────
    // 6. EVALUATIONS — for evaluated candidates
    // ─────────────────────────────────────────
    const evaluatedCands = createdCandidates.filter((c) => ["EVALUATED", "OFFERED"].includes(c.status));
    for (const c of evaluatedCands) {
      const ex = await prisma.evaluation.findFirst({ where: { candidateId: c.id } });
      if (!ex) {
        const tech = 7.5 + Math.random() * 2;
        const hr   = 7.0 + Math.random() * 2.5;
        const comm = 7.0 + Math.random() * 2;
        const cult = 7.5 + Math.random() * 2;
        await prisma.evaluation.create({
          data: {
            candidateId: c.id,
            technicalScore: parseFloat(tech.toFixed(1)),
            hrScore: parseFloat(hr.toFixed(1)),
            communicationScore: parseFloat(comm.toFixed(1)),
            culturalFitScore: parseFloat(cult.toFixed(1)),
            overallScore: parseFloat(((tech + hr + comm + cult) / 4).toFixed(1)),
            recommendation: tech > 8.5 ? "STRONG_HIRE" : "HIRE",
            aiSummary: "Candidate demonstrated strong technical aptitude with clear communication. Recommended for hire.",
          },
        });
      }
    }

    // ─────────────────────────────────────────
    // 7. OFFERS — for candidates with status OFFERED
    // ─────────────────────────────────────────
    const offeredCands = createdCandidates.filter((c) => c.status === "OFFERED");
    for (const c of offeredCands) {
      const ex = await prisma.offer.findFirst({ where: { candidateId: c.id } });
      if (!ex) {
        const joining = new Date();
        joining.setDate(joining.getDate() + 30);
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 14);
        await prisma.offer.create({
          data: {
            candidateId: c.id,
            salary: 160000,
            joiningDate: joining,
            department: "Sales",
            position: "Enterprise Sales Executive",
            benefits: "Health insurance, 30 paid leaves, flexible WFH",
            status: "SENT",
            expiresAt: expiry,
          },
        });
      }
    }

    // ─────────────────────────────────────────
    // 8. TRAININGS
    // ─────────────────────────────────────────
    const trainingData = [
      { title: "Workplace Safety & Compliance",       category: "Compliance",             mandatory: true,  duration: 2 },
      { title: "Cybersecurity Awareness",             category: "Compliance",             mandatory: true,  duration: 3 },
      { title: "AI Ethics & Responsible AI Usage",   category: "Compliance",             mandatory: true,  duration: 2 },
      { title: "Data Privacy & GDPR",                category: "Compliance",             mandatory: true,  duration: 2 },
      { title: "Diversity & Inclusion",              category: "Compliance",             mandatory: true,  duration: 2 },
      { title: "Effective Communication Skills",     category: "Professional Development", mandatory: false, duration: 4 },
      { title: "Leadership & Management Essentials", category: "Leadership",             mandatory: false, duration: 6 },
      { title: "Advanced TypeScript & Node.js",      category: "Technical",              mandatory: false, duration: 8 },
      { title: "Product Thinking for Engineers",     category: "Technical",              mandatory: false, duration: 5 },
    ];

    const trainingMap: Record<string, any> = {};
    for (const t of trainingData) {
      let training = await prisma.training.findFirst({ where: { title: t.title } });
      if (!training) training = await prisma.training.create({ data: { ...t, description: t.title } });
      trainingMap[t.title] = training;
    }

    const allEmployees = await prisma.employee.findMany();
    const mandatoryTrainings = Object.values(trainingMap).filter((t) => t.mandatory);
    const optionalTrainings = Object.values(trainingMap).filter((t) => !t.mandatory);

    for (const emp of allEmployees) {
      for (const t of mandatoryTrainings) {
        const ex = await prisma.trainingAssignment.findUnique({
          where: { employeeId_trainingId: { employeeId: emp.id, trainingId: t.id } },
        });
        if (!ex) {
          const statuses = ["COMPLETED", "COMPLETED", "IN_PROGRESS", "ASSIGNED"];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          await prisma.trainingAssignment.create({
            data: {
              employeeId: emp.id,
              trainingId: t.id,
              status,
              progress: status === "COMPLETED" ? 100 : status === "IN_PROGRESS" ? 60 : 0,
              completedAt: status === "COMPLETED" ? new Date() : undefined,
            },
          });
        }
      }
      // Assign 1-2 optional trainings per employee
      const assigned = optionalTrainings.slice(0, 2);
      for (const t of assigned) {
        const ex = await prisma.trainingAssignment.findUnique({
          where: { employeeId_trainingId: { employeeId: emp.id, trainingId: t.id } },
        });
        if (!ex) {
          await prisma.trainingAssignment.create({
            data: { employeeId: emp.id, trainingId: t.id, status: "ASSIGNED", progress: 0 },
          });
        }
      }
    }

    // ─────────────────────────────────────────
    // 9. PAYROLL — last 3 months for all employees
    // ─────────────────────────────────────────
    const now = new Date();
    for (const emp of allEmployees) {
      for (let i = 1; i <= 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const ex = await prisma.payroll.findUnique({
          where: { employeeId_month_year: { employeeId: emp.id, month, year } },
        });
        if (!ex) {
          const allowances = emp.salary * 0.2;
          const tax = emp.salary * 0.1;
          const deductions = emp.salary * 0.05;
          await prisma.payroll.create({
            data: {
              employeeId: emp.id,
              month,
              year,
              baseSalary: emp.salary,
              allowances,
              tax,
              deductions,
              bonuses: i === 1 ? emp.salary * 0.1 : 0,
              netPay: emp.salary + allowances - tax - deductions + (i === 1 ? emp.salary * 0.1 : 0),
              status: "PAID",
              paidAt: new Date(year, month - 1, 28),
            },
          });
        }
      }
    }

    // ─────────────────────────────────────────
    // 10. LEAVE REQUESTS
    // ─────────────────────────────────────────
    const leaveTypes = ["CASUAL", "SICK", "ANNUAL"];
    let leaveIdx = 0;
    for (const emp of allEmployees.slice(0, 6)) {
      const ex = await prisma.leave.findFirst({ where: { employeeId: emp.id } });
      if (!ex) {
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, (leaveIdx % 20) + 1);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (leaveIdx % 3) + 1);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
        await prisma.leave.create({
          data: {
            employeeId: emp.id,
            type: leaveTypes[leaveIdx % 3],
            startDate,
            endDate,
            days,
            reason: ["Family function", "Medical leave", "Personal reasons", "Vacation"][leaveIdx % 4],
            status: ["APPROVED", "APPROVED", "PENDING"][leaveIdx % 3],
            approvedBy: ["APPROVED", "APPROVED"].includes(["APPROVED", "APPROVED", "PENDING"][leaveIdx % 3])
              ? "Srivardhan"
              : undefined,
          },
        });
        leaveIdx++;
      }
    }

    // ─────────────────────────────────────────
    // 11. PERFORMANCE REVIEWS — current year Q1
    // ─────────────────────────────────────────
    for (const emp of allEmployees) {
      const ex = await prisma.performanceReview.findFirst({ where: { employeeId: emp.id } });
      if (!ex) {
        const rating = parseFloat((3.5 + Math.random() * 1.5).toFixed(1));
        await prisma.performanceReview.create({
          data: {
            employeeId: emp.id,
            quarter: 1,
            year: now.getFullYear(),
            rating,
            feedback: rating >= 4.5
              ? "Exceptional performance. Consistently exceeds expectations."
              : rating >= 3.5
              ? "Strong contributor. Meets all targets with quality output."
              : "Good effort. Some areas to improve in Q2.",
            goals: JSON.stringify(["Complete Q2 roadmap", "Improve code coverage to 85%", "Mentor 1 junior"]),
            achievements: JSON.stringify(["Shipped 3 major features", "Zero critical bugs in quarter"]),
            areasOfImprovement: "Communication in cross-team meetings",
            aiSuggestions: "Consider enrolling in Leadership & Management training to accelerate career growth.",
            status: "COMPLETED",
            reviewedBy: "Srivardhan",
          },
        });
      }
    }

    // ─────────────────────────────────────────
    // 12. RECOGNITIONS
    // ─────────────────────────────────────────
    const recognitionData = [
      { name: "Yuvan",    title: "Best Technical Delivery",     category: "Innovation",  points: 500 },
      { name: "Srivally", title: "Outstanding Design Quality",  category: "Teamwork",    points: 400 },
      { name: "Srujana",  title: "Marketing Campaign MVP",      category: "Leadership",  points: 350 },
      { name: "Rahul",    title: "Top Sales Performer",         category: "Customer",    points: 600 },
      { name: "Srikar",   title: "Best Engineering Manager",    category: "Leadership",  points: 750 },
    ];

    for (const r of recognitionData) {
      const emp = await prisma.employee.findFirst({ where: { name: r.name } });
      if (emp) {
        const ex = await prisma.recognition.findFirst({ where: { employeeId: emp.id, title: r.title } });
        if (!ex) {
          await prisma.recognition.create({
            data: {
              employeeId: emp.id,
              awardedBy: "Srivardhan",
              title: r.title,
              category: r.category,
              points: r.points,
              description: `Awarded for outstanding contribution in ${r.category.toLowerCase()}.`,
            },
          });
        }
      }
    }

    const finalCount = await prisma.employee.count();
    return NextResponse.json({
      message: "Database seeded successfully ✅",
      employees: finalCount,
      candidates: await prisma.candidate.count(),
      jobOpenings: await prisma.jobOpening.count(),
      interviews: await prisma.interview.count(),
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
