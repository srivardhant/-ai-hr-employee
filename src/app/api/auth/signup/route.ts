import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateEmployeeId, generateCompanyEmail } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { name, email, password, department, position, phone, gender } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const count = await prisma.employee.count();
    const empId = generateEmployeeId(count + 1);
    const companyEmail = generateCompanyEmail(name);

    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: "EMPLOYEE" },
    });

    await prisma.employee.create({
      data: {
        userId: user.id,
        employeeId: empId,
        name,
        email: companyEmail,
        companyEmail,
        phone: phone || "",
        gender: gender || "",
        department: department || "General",
        position: position || "Employee",
        salary: 0,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ message: "Account created successfully", email, employeeId: empId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
