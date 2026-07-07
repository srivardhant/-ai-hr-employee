import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leaveSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    let whereClause = {};
    if (employeeId) {
      whereClause = { employeeId };
    }

    const leaves = await prisma.leave.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { name: true, employeeId: true, department: true },
        },
      },
      orderBy: { startDate: "desc" },
    });
    return NextResponse.json(leaves);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, type, startDate, endDate, reason } = body;

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const validated = leaveSchema.parse({ type, startDate, endDate, reason });

    const start = new Date(validated.startDate);
    const end = new Date(validated.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = await prisma.leave.create({
      data: {
        employeeId,
        type: validated.type,
        startDate: start,
        endDate: end,
        days: diffDays,
        reason: validated.reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(leave);
  } catch (error: any) {
    console.error("Leave apply POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit leave request" },
      { status: 400 }
    );
  }
}

// PUT for Approvals
export async function PUT(request: Request) {
  try {
    const { id, status, approvedBy, notes } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Leave ID and status are required" }, { status: 400 });
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: {
        status,
        approvedBy: approvedBy || "HR System",
        approvedAt: new Date(),
        notes,
      },
      include: {
        employee: true,
      },
    });

    // Notify employee about approval/rejection
    await prisma.notification.create({
      data: {
        userId: leave.employee.userId,
        title: `Leave Request ${status}`,
        message: `Your leave request for ${leave.days} days starting ${new Date(
          leave.startDate
        ).toLocaleDateString()} has been ${status.toLowerCase()} by ${approvedBy || "HR"}.`,
        type: status === "APPROVED" ? "SUCCESS" : "ERROR",
        link: "/leave",
      },
    });

    return NextResponse.json(leave);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
