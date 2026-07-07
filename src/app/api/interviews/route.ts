import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { interviewSchema } from "@/lib/validators";

export async function GET() {
  try {
    const interviews = await prisma.interview.findMany({
      include: {
        candidate: {
          select: { name: true, email: true },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });
    return NextResponse.json(interviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = interviewSchema.parse(body);

    const interview = await prisma.interview.create({
      data: {
        candidateId: validated.candidateId,
        scheduledAt: new Date(validated.scheduledAt),
        duration: validated.duration,
        type: validated.type,
        panelMembers: validated.panelMembers,
        location: validated.location || "Google Meet",
        status: "SCHEDULED",
        notes: validated.notes || "",
      },
    });

    // Update candidate status to INTERVIEW
    await prisma.candidate.update({
      where: { id: validated.candidateId },
      data: { status: "INTERVIEW" },
    });

    return NextResponse.json(interview);
  } catch (error: any) {
    console.error("Interview scheduling POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to schedule interview" },
      { status: 400 }
    );
  }
}
