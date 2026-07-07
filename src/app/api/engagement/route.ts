import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surveysOnly = searchParams.get("surveysOnly");
    const recognitionsOnly = searchParams.get("recognitionsOnly");

    if (surveysOnly) {
      const surveys = await prisma.engagementSurvey.findMany({
        include: {
          feedback: true,
        },
      });
      return NextResponse.json(surveys);
    }

    if (recognitionsOnly) {
      const recognitions = await prisma.recognition.findMany({
        include: {
          employee: {
            select: { name: true, employeeId: true, department: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(recognitions);
    }

    // Default return all engagement dashboards data (surveys + recognitions list)
    const surveys = await prisma.engagementSurvey.findMany();
    const recognitions = await prisma.recognition.findMany({
      include: {
        employee: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ surveys, recognitions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}

// POST for submitting recognition / awards
export async function POST(request: Request) {
  try {
    const { employeeId, title, description, category, points, awardedBy } = await request.json();

    if (!employeeId || !title) {
      return NextResponse.json({ error: "Employee and title are required" }, { status: 400 });
    }

    const recognition = await prisma.recognition.create({
      data: {
        employeeId,
        title,
        description: description || "",
        category: category || "General",
        points: points ? parseInt(points) : 10,
        awardedBy: awardedBy || "Management Team",
      },
      include: {
        employee: true,
      },
    });

    // Notify employee of award
    await prisma.notification.create({
      data: {
        userId: recognition.employee.userId,
        title: "New Recognition Awarded!",
        message: `Congratulations! You received recognition: "${title}" from ${recognition.awardedBy} (+${recognition.points} points).`,
        type: "SUCCESS",
        link: "/engagement",
      },
    });

    return NextResponse.json(recognition);
  } catch (error: any) {
    console.error("Recognition POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
