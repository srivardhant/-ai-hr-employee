import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const employees = await p.employee.findMany();
  console.log("Employees:", employees.length);
  for (const e of employees) console.log(`  ${e.name} (${e.employeeId}) — ${e.department}, ${e.position}, $${e.salary}`);
  const users = await p.user.findMany();
  console.log("\nUsers:", users.length);
  for (const u of users) console.log(`  ${u.name} (${u.email}) — ${u.role}`);
  await p.$disconnect();
}
main();