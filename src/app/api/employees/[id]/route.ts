import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        manager: {
          select: { name: true, department: true },
        },
        leaves: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        payrolls: {
          orderBy: [{ year: "desc" }, { month: "desc" }],
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

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
