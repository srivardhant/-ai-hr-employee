import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const all = searchParams.get("all");

    if (all === "true") {
      const assignments = await prisma.trainingAssignment.findMany({
        include: { training: true, employee: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(assignments);
    }

    if (employeeId) {
      const assignments = await prisma.trainingAssignment.findMany({
        where: { employeeId },
        include: { training: true, employee: true },
      });
      return NextResponse.json(assignments);
    }

    const trainings = await prisma.training.findMany({
      orderBy: { title: "asc" },
    });
    return NextResponse.json(trainings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Assignment creation
    if (body.employeeId && body.trainingId) {
      const existing = await prisma.trainingAssignment.findFirst({
        where: { employeeId: body.employeeId, trainingId: body.trainingId },
      });
      if (existing) {
        return NextResponse.json({ error: "Course already assigned to this employee" }, { status: 400 });
      }

      const assignment = await prisma.trainingAssignment.create({
        data: {
          employeeId: body.employeeId,
          trainingId: body.trainingId,
          status: "NOT_STARTED",
          progress: 0,
        },
        include: { training: true, employee: true },
      });
      return NextResponse.json(assignment);
    }

    const { title, description, category, duration, mandatory } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const training = await prisma.training.create({
      data: {
        title,
        description,
        category: category || "General",
        duration: duration ? parseInt(duration) : 0,
        mandatory: !!mandatory,
      },
    });

    return NextResponse.json(training);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT to update progress of training assignment (e.g. simulation)
export async function PUT(request: Request) {
  try {
    const { assignmentId, progress, role } = await request.json();
    if (role !== "EMPLOYEE") {
      return NextResponse.json({ error: "Only employees can complete training courses" }, { status: 403 });
    }

    if (!assignmentId || progress === undefined) {
      return NextResponse.json({ error: "Assignment ID and progress required" }, { status: 400 });
    }

    const currentProg = parseInt(progress);
    const status = currentProg >= 100 ? "COMPLETED" : "IN_PROGRESS";
    const completedAt = currentProg >= 100 ? new Date() : null;

    const assignment = await prisma.trainingAssignment.update({
      where: { id: assignmentId },
      data: {
        progress: currentProg,
        status,
        completedAt,
        startedAt: new Date(), // start time set when they begin progress
      },
      include: {
        training: true,
        employee: true,
      },
    });

    // If completed, notify employee and issue certificate mock link
    if (status === "COMPLETED") {
      const certUrl = `/certificates/cert_${assignment.id}.pdf`;
      
      await prisma.trainingAssignment.update({
        where: { id: assignmentId },
        data: { certificateUrl: certUrl },
      });

      await prisma.notification.create({
        data: {
          userId: assignment.employee.userId,
          title: "Course Completed!",
          message: `Congratulations! You have completed the course "${assignment.training.title}" and generated your certificate.`,
          type: "SUCCESS",
          link: "/training",
        },
      });
    }

    return NextResponse.json(assignment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
