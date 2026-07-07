const API_KEY = process.env.AI_API_KEY || "";
const PROVIDER = process.env.AI_PROVIDER || "google";

const GOOGLE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

interface AiResponse {
  content: string;
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<AiResponse> {
  if (!API_KEY) return { content: "" };

  if (PROVIDER === "google") {
    const res = await fetch(`${GOOGLE_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
      }),
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return { content: text };
  }

  // GROQ
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    }),
  });
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return { content: text };
}

export async function parseWorkflowWithAI(input: string) {
  const systemPrompt = `You are an HR workflow parser. Extract structured data from natural language input.
Return ONLY valid JSON with this shape, no markdown, no explanation:
{
  "type": "ONBOARDING" | "PROMOTION" | "PAYROLL" | "LEAVE" | "UNKNOWN",
  "data": {}
}

For ONBOARDING: data = { "name": string, "position": string, "department": string, "salary": number }
For PROMOTION: data = { "name": string, "toPosition": string, "salaryIncrease": number (percentage) }
For PAYROLL: data = { "action": string }
For LEAVE: data = { "action": string }
For UNKNOWN: data = {}`;

  const result = await callAI(systemPrompt, input);
  if (!result.content) return null;

  try {
    return JSON.parse(result.content);
  } catch {
    return null;
  }
}

export async function generateScreenScore(candidateName: string, skills: string, experience: number, jobTitle: string) {
  const systemPrompt = `You are an AI HR recruiter screening candidates. 
Return ONLY a JSON object with: { "score": number (0-100), "summary": string, "strengths": string[], "concerns": string[] }`;

  const userPrompt = `Evaluate this candidate for "${jobTitle}":
Name: ${candidateName}
Skills: ${skills}
Experience: ${experience} years`;

  const result = await callAI(systemPrompt, userPrompt);
  if (!result.content) return null;

  try {
    return JSON.parse(result.content);
  } catch {
    return null;
  }
}

export async function generateEvaluationSummary(
  candidateName: string,
  scores: { technical: number; hr: number; communication: number; culturalFit: number }
) {
  const systemPrompt = `You are an AI HR evaluator. Generate a concise evaluation summary.
Return ONLY JSON: { "summary": string, "recommendation": "STRONG_HIRE" | "HIRE" | "MAYBE" | "NO_HIRE" }`;

  const userPrompt = `Evaluate ${candidateName}:
Technical: ${scores.technical}/10
HR: ${scores.hr}/10
Communication: ${scores.communication}/10
Cultural Fit: ${scores.culturalFit}/10`;

  const result = await callAI(systemPrompt, userPrompt);
  if (!result.content) return null;

  try {
    return JSON.parse(result.content);
  } catch {
    return null;
  }
}

export async function generatePerformanceSuggestions(
  employeeName: string,
  rating: number,
  strengths: string[],
  improvements: string[]
) {
  const systemPrompt = `You are an AI career coach. Generate 3 actionable career development suggestions.
Return ONLY JSON: { "suggestions": string[] }`;

  const userPrompt = `Employee: ${employeeName}
Rating: ${rating}/5
Strengths: ${strengths.join(", ")}
Areas to improve: ${improvements.join(", ")}`;

  const result = await callAI(systemPrompt, userPrompt);
  if (!result.content) return null;

  try {
    return JSON.parse(result.content);
  } catch {
    return null;
  }
}
