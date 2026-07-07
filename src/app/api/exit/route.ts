import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exitSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const exits = await prisma.exitProcess.findMany({
      include: {
        employee: {
          select: { name: true, employeeId: true, department: true, position: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(exits);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = exitSchema.parse(body);

    // Initial asset checklist checklist (mock json structure)
    const assetChecklist = [
      { id: "laptop", name: "Corporate Laptop & Charger", returned: false },
      { id: "badge", name: "Employee Security Badge", returned: false },
      { id: "access", name: "Database access revocation", returned: false },
    ];

    const exit = await prisma.exitProcess.create({
      data: {
        employeeId: validated.employeeId,
        resignationDate: new Date(validated.resignationDate),
        lastWorkingDate: new Date(validated.lastWorkingDate),
        reason: validated.reason,
        assetReturn: JSON.stringify(assetChecklist),
        clearanceStatus: "PENDING",
        settlementStatus: "PENDING",
        status: "INITIATED",
      },
      include: {
        employee: true,
      },
    });

    // Update employee status to RESIGNED
    await prisma.employee.update({
      where: { id: validated.employeeId },
      data: { status: "RESIGNED" },
    });

    // Notify HR managers
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "HR"] } },
    });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "Resignation Submitted",
          message: `Employee ${exit.employee.name} has submitted resignation. Last working date: ${new Date(validated.lastWorkingDate).toLocaleDateString()}.`,
          type: "WARNING",
          link: "/exit",
        },
      });
    }

    return NextResponse.json(exit);
  } catch (error: any) {
    console.error("Exit process POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process resignation submission" },
      { status: 400 }
    );
  }
}

// PUT to update clearance checklist items or settlement status
export async function PUT(request: Request) {
  try {
    const { id, assetReturn, clearanceStatus, settlementAmount, settlementStatus, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Exit process ID required" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (assetReturn !== undefined) dataToUpdate.assetReturn = JSON.stringify(assetReturn);
    if (clearanceStatus !== undefined) dataToUpdate.clearanceStatus = clearanceStatus;
    if (settlementAmount !== undefined) dataToUpdate.settlementAmount = parseFloat(settlementAmount);
    if (settlementStatus !== undefined) dataToUpdate.settlementStatus = settlementStatus;
    if (status !== undefined) {
      dataToUpdate.status = status;
      if (status === "COMPLETED") {
        // Actually terminate the employee record upon exit completions
        const exit = await prisma.exitProcess.findUnique({ where: { id } });
        if (exit) {
          await prisma.employee.update({
            where: { id: exit.employeeId },
            data: { status: "TERMINATED" },
          });
        }
      }
    }

    const exit = await prisma.exitProcess.update({
      where: { id },
      data: dataToUpdate,
      include: {
        employee: true,
      },
    });

    return NextResponse.json(exit);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
