import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluationSchema } from "@/lib/validators";
import { ZodError } from "zod";
import { generateEvaluationSummary } from "@/lib/ai";

export async function GET() {
  try {
    const evaluations = await prisma.evaluation.findMany({
      include: {
        candidate: {
          select: { name: true, skills: true, experience: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(evaluations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = evaluationSchema.parse(body);

    const overallScore =
      (validated.technicalScore +
        validated.hrScore +
        validated.communicationScore +
        validated.culturalFitScore) /
      4;

    // Generate AI evaluation summary based on inputs
    const candidate = await prisma.candidate.findUnique({
      where: { id: validated.candidateId },
    });

    const candidateName = candidate?.name || "Candidate";
    const recommendationText =
      validated.recommendation === "STRONG_HIRE"
        ? "Highly Recommended"
        : validated.recommendation === "HIRE"
        ? "Recommended"
        : validated.recommendation === "MAYBE"
        ? "Borderline"
        : "Not Recommended";

    const aiResult = await generateEvaluationSummary(candidateName, {
      technical: validated.technicalScore,
      hr: validated.hrScore,
      communication: validated.communicationScore,
      culturalFit: validated.culturalFitScore,
    });
    const aiSummary = aiResult?.summary || `AI Screening analysis on overall ratings indicates: ${candidateName} has achieved an overall average rating of ${overallScore.toFixed(1)}/10. Technical score is evaluated at ${validated.technicalScore}/10 and HR behavioral score is ${validated.hrScore}/10. Communication is rated ${validated.communicationScore}/10. Conclusion: Candidate is marked as "${recommendationText}" based on matching profiles and screening filters.`;

    const evaluation = await prisma.evaluation.create({
      data: {
        candidateId: validated.candidateId,
        technicalScore: validated.technicalScore,
        hrScore: validated.hrScore,
        communicationScore: validated.communicationScore,
        culturalFitScore: validated.culturalFitScore,
        overallScore,
        recommendation: validated.recommendation,
        aiSummary,
        evaluatorNotes: validated.evaluatorNotes || "",
      },
    });

    // Update candidate status to EVALUATED
    await prisma.candidate.update({
      where: { id: validated.candidateId },
      data: { status: "EVALUATED" },
    });

    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error("Evaluation POST error:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to create evaluation" },
      { status: 400 }
    );
  }
}
