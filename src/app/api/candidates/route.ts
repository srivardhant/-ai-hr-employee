import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { candidateSchema } from "@/lib/validators";
import { ZodError } from "zod";
import { generateScreenScore } from "@/lib/ai";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        jobOpening: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(candidates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = candidateSchema.parse(body);

    let finalScore = 50;
    let aiNotes = "";

    const jobOpening = validated.jobOpeningId
      ? await prisma.jobOpening.findUnique({ where: { id: validated.jobOpeningId } })
      : null;

    const aiResult = await generateScreenScore(
      validated.name,
      validated.skills || "",
      validated.experience || 0,
      jobOpening?.title || "General Position"
    );

    if (aiResult) {
      finalScore = aiResult.score;
      aiNotes = `AI: ${aiResult.summary}\nStrengths: ${aiResult.strengths.join(", ")}\nConcerns: ${aiResult.concerns.join(", ")}`;
    } else {
      let score = 50;
      score += Math.min(30, (validated.experience || 0) * 5);
      if (validated.skills) {
        const skillsList = validated.skills.toLowerCase().split(",");
        const keywords = ["react", "next.js", "typescript", "node", "prisma", "sql", "tailwind", "python", "aws", "docker"];
        let matchCount = 0;
        skillsList.forEach((skill) => {
          if (keywords.some((k) => skill.trim().includes(k))) {
            matchCount++;
          }
        });
        score += Math.min(20, matchCount * 5);
      }
      score += Math.floor(Math.random() * 11) - 5;
      finalScore = Math.min(100, Math.max(0, score));
    }

    const candidate = await prisma.candidate.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        experience: validated.experience,
        skills: validated.skills || "",
        jobOpeningId: validated.jobOpeningId || null,
        status: "SCREENING",
        aiScreenScore: finalScore,
        notes: aiNotes || validated.notes || "",
      },
    });

    return NextResponse.json(candidate);
  } catch (error: any) {
    console.error("Candidate POST error:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to add candidate" },
      { status: 400 }
    );
  }
}
