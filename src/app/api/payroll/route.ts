import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { payrollSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    let whereClause = {};
    if (employeeId) {
      whereClause = { employeeId };
    }

    const payrolls = await prisma.payroll.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { name: true, employeeId: true, position: true, department: true },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return NextResponse.json(payrolls);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = payrollSchema.parse(body);

    const netPay =
      validated.baseSalary +
      validated.allowances +
      validated.bonuses -
      validated.deductions -
      validated.tax;

    // Check if payroll already processed for employee, month, year
    const existing = await prisma.payroll.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: validated.employeeId,
          month: validated.month,
          year: validated.year,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Payroll already generated for this month and year." },
        { status: 400 }
      );
    }

    const payroll = await prisma.payroll.create({
      data: {
        employeeId: validated.employeeId,
        month: validated.month,
        year: validated.year,
        baseSalary: validated.baseSalary,
        allowances: validated.allowances,
        deductions: validated.deductions,
        tax: validated.tax,
        bonuses: validated.bonuses,
        netPay,
        status: "DRAFT",
        notes: validated.notes || "",
      },
    });

    return NextResponse.json(payroll);
  } catch (error: any) {
    console.error("Payroll POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payroll" },
      { status: 400 }
    );
  }
}

// PUT to approve payout
export async function PUT(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Payroll ID is required" }, { status: 400 });
    }

    const payroll = await prisma.payroll.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
      include: {
        employee: true,
      },
    });

    // Notify employee of payslip paid status
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    await prisma.notification.create({
      data: {
        userId: payroll.employee.userId,
        title: "Salary Paid",
        message: `Your payslip for ${monthNames[payroll.month - 1]} ${payroll.year} of net amount $${payroll.netPay.toLocaleString()} has been processed and paid out.`,
        type: "SUCCESS",
        link: "/payroll",
      },
    });

    return NextResponse.json(payroll);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
