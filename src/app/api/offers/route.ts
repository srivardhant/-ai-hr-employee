import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { offerSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function GET() {
  try {
    const offers = await prisma.offer.findMany({
      include: {
        candidate: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(offers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = offerSchema.parse(body);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // offer expires in 7 days

    const offer = await prisma.offer.create({
      data: {
        candidateId: validated.candidateId,
        salary: validated.salary,
        joiningDate: new Date(validated.joiningDate),
        department: validated.department,
        position: validated.position,
        benefits: validated.benefits || "Standard company benefits (Health, 401k, 20 Days PTO)",
        status: "DRAFT",
        expiresAt,
        notes: validated.notes || "",
      },
    });

    // Update candidate status to OFFERED
    await prisma.candidate.update({
      where: { id: validated.candidateId },
      data: { status: "OFFERED" },
    });

    return NextResponse.json(offer);
  } catch (error: any) {
    console.error("Offer creation POST error:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to create offer" },
      { status: 400 }
    );
  }
}

// PUT endpoint to update status (DRAFT -> SENT -> ACCEPTED/REJECTED)
export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Offer ID and status are required" }, { status: 400 });
    }

    const offer = await prisma.offer.update({
      where: { id },
      data: { status },
    });

    if (status === "ACCEPTED") {
      // Update candidate to HIRED
      await prisma.candidate.update({
        where: { id: offer.candidateId },
        data: { status: "HIRED" },
      });
    }

    return NextResponse.json(offer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
