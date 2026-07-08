import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { employeeSchema } from "@/lib/validators";
import { ZodError } from "zod";
import { generateEmployeeId, generateCompanyEmail } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const email = searchParams.get("email");
    const search = searchParams.get("search");

    if (search) {
      const q = search.toLowerCase();
      const all = await prisma.employee.findMany({
        include: { manager: { select: { name: true } } },
      });
      const filtered = all.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.position.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q)
      ).slice(0, 10);
      return NextResponse.json(filtered);
    }

    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(null);
      }
      const employee = await prisma.employee.findUnique({
        where: { userId: user.id },
        include: {
          manager: {
            select: { name: true },
          },
        },
      });
      return NextResponse.json(employee);
    }

    let whereClause = {};
    if (department) {
      whereClause = { department };
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        manager: {
          select: { name: true },
        },
      },
      orderBy: { employeeId: "asc" },
    });

    return NextResponse.json(employees);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = employeeSchema.parse(body);

    // Create user credentials account
    const username = validated.name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 100);
    const tempEmail = `${username}@temp-aihr.com`;

    const user = await prisma.user.create({
      data: {
        email: tempEmail,
        password: "$2a$10$tMh4uMlh6uV514yD1mI34ux6Tf3P1Buxp.V/T4cTszT1.6O20NfKG", // bcrypt of 'password123'
        name: validated.name,
        role: validated.status === "TERMINATED" ? "EMPLOYEE" : "EMPLOYEE",
      },
    });

    const count = await prisma.employee.count();
    const empId = generateEmployeeId(count + 1);
    const companyEmail = generateCompanyEmail(validated.name);

    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeId: empId,
        name: validated.name,
        email: companyEmail,
        companyEmail,
        phone: validated.phone,
        department: validated.department,
        position: validated.position,
        salary: validated.salary,
        managerId: validated.managerId || null,
        status: validated.status || "ACTIVE",
        address: validated.address,
        dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
        emergencyContact: validated.emergencyContact,
      },
    });

    // Update user record with final company email
    await prisma.user.update({
      where: { id: user.id },
      data: { email: companyEmail },
    });

    // Create system notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome onboard!",
        message: `Your employee profile has been generated successfully. Your Employee ID is ${empId}.`,
        type: "SUCCESS",
      },
    });

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error("Employee POST API error:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to create employee" },
      { status: 400 }
    );
  }
}
