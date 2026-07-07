import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promotionSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    let whereClause = {};
    if (employeeId) {
      whereClause = { employeeId };
    }

    const promotions = await prisma.promotion.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { name: true, employeeId: true, position: true, department: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(promotions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = promotionSchema.parse(body);

    const employee = await prisma.employee.findUnique({
      where: { id: validated.employeeId },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const revisionPct = Math.round(((validated.toSalary - employee.salary) / employee.salary) * 100);

    const promotion = await prisma.promotion.create({
      data: {
        employeeId: validated.employeeId,
        fromPosition: employee.position,
        toPosition: validated.toPosition,
        fromSalary: employee.salary,
        toSalary: validated.toSalary,
        salaryRevision: revisionPct,
        reason: validated.reason,
        status: "PROPOSED",
      },
    });

    return NextResponse.json(promotion);
  } catch (error: any) {
    console.error("Promotion POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit promotion proposal" },
      { status: 400 }
    );
  }
}

// PUT to approve promotion
export async function PUT(request: Request) {
  try {
    const { id, status, approvedBy } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Promotion ID and status are required" }, { status: 400 });
    }

    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        status,
        approvedBy: approvedBy || "HR System",
        effectiveDate: status === "APPROVED" ? new Date() : null,
      },
      include: {
        employee: true,
      },
    });

    if (status === "APPROVED") {
      // Actually update employee position and salary
      await prisma.employee.update({
        where: { id: promotion.employeeId },
        data: {
          position: promotion.toPosition,
          salary: promotion.toSalary,
        },
      });

      // Notify employee
      await prisma.notification.create({
        data: {
          userId: promotion.employee.userId,
          title: "Promotion Approved!",
          message: `Congratulations! Your promotion to ${promotion.toPosition} has been approved. New salary: $${promotion.toSalary.toLocaleString()}.`,
          type: "SUCCESS",
          link: "/performance",
        },
      });
    }

    return NextResponse.json(promotion);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
