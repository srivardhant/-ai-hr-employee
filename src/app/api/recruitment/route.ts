import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const openings = await prisma.jobOpening.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(openings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, department, description, requirements, location, type, salaryMin, salaryMax, openings } = await request.json();

    if (!title || !department || !description) {
      return NextResponse.json(
        { error: "Title, Department, and Description are required" },
        { status: 400 }
      );
    }

    const job = await prisma.jobOpening.create({
      data: {
        title,
        department,
        description,
        requirements: requirements || "",
        location: location || "Remote",
        type: type || "Full-time",
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        openings: openings ? parseInt(openings) : 1,
        status: "OPEN",
      },
    });

    return NextResponse.json(job);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}
