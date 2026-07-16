import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const employees = await p.employee.findMany({ select: { name: true, employeeId: true, department: true, position: true, salary: true } });
  console.log(JSON.stringify(employees, null, 2));
  await p.$disconnect();
}
main();