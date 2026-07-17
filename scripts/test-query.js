const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const employees = await prisma.employee.findMany();
  console.log("Total employees:", employees.length);
  if (employees.length > 0) {
    console.log("First employee ID:", employees[0].id);
    const employee = await prisma.employee.findUnique({
      where: { id: employees[0].id },
      include: {
        manager: {
          select: { name: true, department: true },
        },
        leaves: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        payrolls: {
          orderBy: { year: "desc", month: "desc" },
          take: 5,
        },
        trainings: {
          include: {
            training: true,
          },
        },
        onboarding: true,
        exitProcess: true,
      },
    });
    console.log("Found detail:", employee ? "YES" : "NO");
    if (!employee) {
       console.log("Attempted to find with ID:", employees[0].id);
    }
  }
}

test().catch(console.error).finally(() => prisma.$disconnect());
