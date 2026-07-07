import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WorkflowEngine } from "@/lib/workflow-engine";

export async function GET() {
  try {
    const onboardings = await prisma.onboarding.findMany({
      include: {
        employee: {
          select: { name: true, employeeId: true, department: true, position: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(onboardings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}

export async function POST(request: Request) {
  try {
    const { candidateId, name, position, department, salary, triggeredBy } = await request.json();

    let inputString = "";
    if (candidateId) {
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        include: { offer: true },
      });

      if (!candidate) {
        return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
      }

      const offerSalary = candidate.offer?.salary || 80000;
      const jobTitle = candidate.offer?.position || "Software Engineer";
      const jobDept = candidate.offer?.department || "Engineering";

      inputString = `A new employee ${candidate.name} joined as ${jobTitle} in ${jobDept} department with a salary of $${offerSalary}.`;

      // Trigger Onboarding via Workflow Engine
      const result = await WorkflowEngine.runOnboarding(inputString, triggeredBy || "HR System");

      // Update candidate to HIRED
      await prisma.candidate.update({
        where: { id: candidateId },
        data: { status: "HIRED" },
      });

      return NextResponse.json(result);
    } else if (name && position && department) {
      inputString = `A new employee ${name} joined as ${position} in ${department} department with a salary of $${salary || 75000}.`;
      const result = await WorkflowEngine.runOnboarding(inputString, triggeredBy || "HR System");
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "Provide either candidateId or name, position, and department details." },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Onboarding workflow trigger error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
