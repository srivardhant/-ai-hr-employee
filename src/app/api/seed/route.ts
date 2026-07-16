import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const existing = await prisma.employee.count();
    if (existing > 1) {
      return NextResponse.json({ message: "Database already seeded (" + existing + " employees)" });
    }

    // 1. Update Srivardhan
    await prisma.employee.updateMany({ where: { name: "Srivardhan" }, data: { salary: 300000, position: "HR Manager", department: "HR" } });

    // 2. Create Srikar
    let srikarEmp = await prisma.employee.findFirst({ where: { name: "Srikar" } });
    if (!srikarEmp) {
      await prisma.user.deleteMany({ where: { email: "srikar@aihr.com" } });
      const u = await prisma.user.create({ data: { email: "srikar@aihr.com", password: await bcrypt.hash("srikar123", 10), name: "Srikar", role: "MANAGER" } });
      srikarEmp = await prisma.employee.create({ data: { userId: u.id, employeeId: "EMP-002", name: "Srikar", email: "srikar@aihr.com", companyEmail: "srikar@aihr.com", phone: "9876543210", gender: "Male", department: "Engineering", position: "Engineering Manager", salary: 150000, status: "ACTIVE" } });
    }

    // 3. Create 5 employees
    const emps = [
      { name: "yuvan", gender: "Male", salary: 85000, dept: "Engineering", pos: "Software Engineer" },
      { name: "hemanth", gender: "Male", salary: 80000, dept: "Engineering", pos: "Software Engineer" },
      { name: "srivally", gender: "Female", salary: 75000, dept: "Design", pos: "UI/UX Designer" },
      { name: "srujana", gender: "Female", salary: 70000, dept: "Marketing", pos: "Marketing Specialist" },
      { name: "rahul", gender: "Male", salary: 65000, dept: "Sales", pos: "Sales Executive" },
    ];
    for (const emp of emps) {
      const email = emp.name + "@aihr.com";
      if (await prisma.employee.findFirst({ where: { name: emp.name } })) continue;
      await prisma.user.deleteMany({ where: { email } });
      const user = await prisma.user.create({ data: { email, password: await bcrypt.hash(emp.name + "123", 10), name: emp.name, role: "EMPLOYEE" } });
      const count = await prisma.employee.count();
      await prisma.employee.create({
        data: { userId: user.id, employeeId: "EMP-" + String(count + 1).padStart(3, "0"), name: emp.name, email, companyEmail: email, phone: "", gender: emp.gender, department: emp.dept, position: emp.pos, salary: emp.salary, status: "ACTIVE", managerId: srikarEmp.id },
      });
    }

    // 4. Candidates
    const candidates = [
      { name: "Srinivas", email: "srinivas@email.com", exp: 3 },
      { name: "Rama", email: "rama@email.com", exp: 2 },
      { name: "Ramesh", email: "ramesh@email.com", exp: 5 },
      { name: "Suresh", email: "suresh@email.com", exp: 4 },
      { name: "Mahender", email: "mahender@email.com", exp: 6 },
      { name: "Priya", email: "priya@email.com", exp: 3 },
      { name: "Varshitha", email: "varshitha@email.com", exp: 2 },
      { name: "Ananya", email: "ananya@email.com", exp: 1 },
    ];
    for (const c of candidates) {
      if (await prisma.candidate.findFirst({ where: { email: c.email } })) continue;
      await prisma.candidate.create({ data: { name: c.name, email: c.email, status: "APPLIED", experience: c.exp } });
    }

    // 5. Trainings
    if ((await prisma.training.count()) === 0) {
      const tData = [
        { title: "Workplace Safety & Compliance", description: "Mandatory workplace safety training", category: "Compliance", mandatory: true, duration: 2 },
        { title: "Cybersecurity Awareness", description: "Best practices for data security", category: "Compliance", mandatory: true, duration: 3 },
        { title: "AI Ethics & Responsible AI Usage", description: "Understanding ethical AI usage", category: "Compliance", mandatory: true, duration: 2 },
        { title: "Effective Communication Skills", description: "Improve workplace communication", category: "Professional Development", mandatory: false, duration: 4 },
        { title: "Leadership & Management", description: "Develop leadership skills", category: "Leadership", mandatory: false, duration: 6 },
        { title: "Data Privacy & GDPR", description: "Understanding data protection regulations", category: "Compliance", mandatory: true, duration: 2 },
        { title: "Diversity & Inclusion", description: "Building an inclusive workplace culture", category: "Compliance", mandatory: true, duration: 2 },
      ];
      for (const t of tData) await prisma.training.create({ data: t });
    }

    // 6. Assign trainings
    const mandatory = await prisma.training.findMany({ where: { mandatory: true } });
    const allEmps = await prisma.employee.findMany();
    for (const emp of allEmps) {
      for (const t of mandatory) {
        const ex = await prisma.trainingAssignment.findUnique({ where: { employeeId_trainingId: { employeeId: emp.id, trainingId: t.id } } });
        if (!ex) await prisma.trainingAssignment.create({ data: { employeeId: emp.id, trainingId: t.id, status: "ASSIGNED" } });
      }
    }

    // 7. Schedule interviews
    const types = ["Technical", "HR", "Cultural"];
    let i = 0;
    const allCands = await prisma.candidate.findMany();
    for (const c of allCands) {
      if (await prisma.interview.findFirst({ where: { candidateId: c.id } })) continue;
      const d = new Date(); d.setDate(d.getDate() + Math.floor(Math.random() * 14) + 1);
      await prisma.interview.create({ data: { candidateId: c.id, scheduledAt: d, type: types[i % 3], status: "SCHEDULED", panelMembers: "Srikar, Srivardhan" } });
      await prisma.candidate.update({ where: { id: c.id }, data: { status: "INTERVIEW" } });
      i++;
    }

    const finalCount = await prisma.employee.count();
    return NextResponse.json({ message: "Database seeded successfully", employees: finalCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
