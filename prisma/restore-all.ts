import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const p = new PrismaClient();
async function main() {
  // 1. Update Srivardhan salary
  await p.employee.updateMany({ where: { name: "Srivardhan" }, data: { salary: 300000, position: "HR Manager", department: "HR" } });
  console.log("Updated Srivardhan — $300,000");

  // 2. Create Srikar (Manager)
  let srikarEmp = await p.employee.findFirst({ where: { name: "Srikar" } });
  if (!srikarEmp) {
    await p.user.deleteMany({ where: { email: "srikar@aihr.com" } });
    const srikarUser = await p.user.create({ data: { email: "srikar@aihr.com", password: await bcrypt.hash("srikar123", 10), name: "Srikar", role: "MANAGER" } });
    srikarEmp = await p.employee.create({ data: { userId: srikarUser.id, employeeId: "EMP-002", name: "Srikar", email: "srikar@aihr.com", companyEmail: "srikar@aihr.com", phone: "9876543210", gender: "Male", department: "Engineering", position: "Engineering Manager", salary: 150000, status: "ACTIVE" } });
    console.log(`Created Srikar (EMP-002)`);
  } else {
    console.log(`Srikar already exists`);
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
    const email = `${emp.name}@aihr.com`;
    const existingEmp = await p.employee.findFirst({ where: { name: emp.name } });
    if (existingEmp) { console.log(`${emp.name} already exists, skipping`); continue; }
    // Clean up orphaned user if any
    await p.user.deleteMany({ where: { email } });
    const hashed = await bcrypt.hash(`${emp.name}123`, 10);
    const user = await p.user.create({
      data: { email, password: hashed, name: emp.name, role: "EMPLOYEE" },
    });
    const count = await p.employee.count();
    const employeeId = `EMP-${String(count + 1).padStart(3, "0")}`;
    await p.employee.create({
      data: {
        userId: user.id,
        employeeId,
        name: emp.name,
        email,
        companyEmail: `${emp.name}@aihr.com`,
        phone: "",
        gender: emp.gender,
        department: emp.dept,
        position: emp.pos,
        salary: emp.salary,
        status: "ACTIVE",
        managerId: srikarEmp.id,
      },
    });
    console.log(`Created: ${emp.name} (${employeeId})`);
  }

  console.log("\nDone! All employees restored.");
  await p.$disconnect();
}
main();