import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { performanceSchema } from "@/lib/validators";
import { generatePerformanceSuggestions } from "@/lib/ai";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    let whereClause = {};
    if (employeeId) {
      whereClause = { employeeId };
    }

    const reviews = await prisma.performanceReview.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { name: true, employeeId: true, position: true, department: true },
        },
      },
      orderBy: [{ year: "desc" }, { quarter: "desc" }],
    });
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = performanceSchema.parse(body);

    const ratingVal = validated.rating;

    const aiResult = await generatePerformanceSuggestions(
      "Employee",
      ratingVal,
      validated.achievements ? JSON.parse(validated.achievements) : [],
      validated.areasOfImprovement ? validated.areasOfImprovement.split(",").map(s => s.trim()) : []
    );
    let aiSuggestions = aiResult?.suggestions?.join("\n") || "";
    if (!aiSuggestions) {
      if (ratingVal >= 4.5) {
        aiSuggestions = "1. Propose promotion track to leadership position.\n2. Nominate for Innovation / Outstanding Leadership awards.\n3. Assign mentoring roles to onboard junior teammates.";
      } else if (ratingVal >= 3.5) {
        aiSuggestions = "1. Enroll in Advanced Skill Training / Technical Leadership courses.\n2. Encourage cross-departmental product collaboration.\n3. Re-align next quarter goals to push project limits.";
      } else {
        aiSuggestions = "1. Setup 1-on-1 performance recovery program.\n2. Assign structured paired coding / training buddy.\n3. Focus goals on core deliverables and weekly status checkers.";
      }
    }

    const review = await prisma.performanceReview.create({
      data: {
        employeeId: validated.employeeId,
        quarter: validated.quarter,
        year: validated.year,
        rating: ratingVal,
        feedback: validated.feedback || "",
        goals: validated.goals || "[]",
        achievements: validated.achievements || "[]",
        areasOfImprovement: validated.areasOfImprovement || "",
        aiSuggestions,
        status: "COMPLETED",
        reviewedBy: "System HR Manager",
      },
    });

    return NextResponse.json(review);
  } catch (error: any) {
    console.error("Performance POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create performance review" },
      { status: 400 }
    );
  }
}
