import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || text.length < 20) {
      return NextResponse.json({ error: "Resume text too short" }, { status: 400 });
    }

    const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean);
    const full = text;

    // Extract name (usually first non-empty line)
    const name = lines[0]?.replace(/^(resume|cv|curriculum vitae)[:\s]*/i, "").trim() || "";

    // Extract email
    const emailMatch = full.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch?.[0] || "";

    // Extract phone
    const phoneMatch = full.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch?.[0] || "";

    // Extract skills (common tech skills)
    const skillKeywords = [
      "JavaScript", "TypeScript", "Python", "Java", "C++", "Ruby", "Go", "Rust", "PHP", "Swift", "Kotlin",
      "React", "Angular", "Vue", "Node", "Express", "Django", "Flask", "Spring", "Next.js", "Nuxt",
      "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL", "REST", "API",
      "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Git",
      "Machine Learning", "AI", "Data Science", "NLP", "Computer Vision",
      "Agile", "Scrum", "Jira", "Project Management", "Leadership",
      "HTML", "CSS", "Tailwind", "Bootstrap", "Sass",
      "Figma", "Sketch", "Adobe XD", "UI/UX", "Design",
    ];
    const foundSkills = skillKeywords.filter(s => full.toLowerCase().includes(s.toLowerCase()));

    // Extract experience (years)
    const expMatch = full.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?experience/i);
    const experience = expMatch?.[1] || "";

    // Extract education
    const eduKeywords = ["Bachelor", "Master", "PhD", "B.Tech", "M.Tech", "B.E.", "M.E.", "MBA", "BCA", "MCA", "B.Sc", "M.Sc"];
    const education = eduKeywords.find(e => full.includes(e)) || "";

    return NextResponse.json({
      name,
      email,
      phone,
      skills: foundSkills.join(", "),
      experience,
      education,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
