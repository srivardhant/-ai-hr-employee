import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // Clear existing data
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

  const password = await bcrypt.hash("srivardhan123", 10);

  const user = await prisma.user.create({
    data: {
      email: "srivardhan@aihr.com",
      password,
      name: "Srivardhan",
      role: "HR",
    },
  });

  await prisma.employee.create({
    data: {
      userId: user.id,
      employeeId: "EMP-001",
      name: "Srivardhan",
      email: "srivardhan@aihr.com",
      companyEmail: "srivardhan@aihr.com",
      phone: "",
      gender: "",
      department: "HR",
      position: "HR Manager",
      salary: 0,
      status: "ACTIVE",
    },
  });

  console.log("Created admin account: srivardhan@aihr.com / srivardhan123");
  console.log("Database is ready for your data.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    prisma.$disconnect();
    process.exit(1);
  });
