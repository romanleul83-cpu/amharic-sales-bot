import OpenAI from "openai";

if (!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
  throw new Error("AI_INTEGRATIONS_OPENAI_BASE_URL must be set.");
}
if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
  throw new Error("AI_INTEGRATIONS_OPENAI_API_KEY must be set.");
}

export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const BUSINESS_CONTEXT = `
You are a friendly and persuasive sales assistant bot for a network marketing business opportunity.

BUSINESS: We help individuals create income through a structured system.
We have four entry packages:
- Starter (low cost, lower earning %)
- Mid levels (moderate cost, moderate earning %)
- Advanced (highest commitment, highest earning potential)

HOW IT WORKS:
1. Direct income from personally introducing people
2. Team income from helping your team grow and duplicate
The system is simple: Invite → Show tool → Follow up → Help them start → Teach them to duplicate

TARGET AUDIENCE: People who want extra or full-time income, frustrated with finances, students, employees, small business owners, beginners.

VALUE PROPOSITION:
- Simple system, no prior experience needed
- Step-by-step guidance and mentorship
- Active and leveraged income
- Personal development (confidence, communication, business skills)
- Scalable income based on effort and consistency

YOUR COMMUNICATION STYLE:
- Simple, clear, action-oriented
- Calm, confident, empathetic
- Never use complex jargon
- Keep responses SHORT (2-4 sentences max per message)
- Use simple, everyday language
- Guide conversations toward a positive decision
- Never be pushy or aggressive
`;

export async function generateAIResponse(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 500,
    messages: [
      { role: "system", content: BUSINESS_CONTEXT + "\n\n" + systemPrompt },
      ...history,
    ],
  });

  return response.choices[0]?.message?.content ?? "I'll get back to you shortly.";
}

export async function handleObjection(
  objection: string,
  history: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const systemPrompt = `
The user has raised an objection or concern. Handle it calmly and confidently.

Common objections to address:
- "Is this a scam?" → Explain it's a legitimate business with real products and a proven system. Many people are earning real income.
- "I don't have money" → Explain there are different entry levels including a starter option. The question is: can you afford NOT to have a second income?
- "I don't have time" → This business is designed to fit into your current schedule. Even 1-2 hours a day can build something.
- "I'm not good at selling" → You don't sell, you share. The system does the presentation for you.
- "I need to think about it" → That's completely fine! What specific questions can I answer to help you make a decision?
- "I need to ask my spouse/partner" → Of course! I can provide materials for both of you to review together.

Always: respond empathetically, address the concern directly, then redirect toward a positive next step.
Keep response to 3-4 sentences MAX.
`;

  return generateAIResponse(
    [...history, { role: "user", content: objection }],
    systemPrompt
  );
}

export async function qualifyLead(answers: Record<string, string>): Promise<{ score: number; temperature: "hot" | "warm" | "cold" }> {
  const systemPrompt = `
Based on these qualification answers, score this lead from 0-100 and classify as hot/warm/cold.

Scoring criteria:
- Wants to make money and is serious (decision maker): +40 points
- Has some time to invest: +20 points
- Is open-minded and willing to learn: +20 points
- Has urgency (needs income soon): +20 points

Hot (70-100): Ready to start, motivated, decision maker
Warm (40-69): Interested but has hesitations
Cold (0-39): Not serious, lots of objections, not ready

Answers: ${JSON.stringify(answers)}

Respond ONLY with valid JSON: {"score": number, "temperature": "hot" | "warm" | "cold", "reason": "brief reason"}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 200,
    messages: [
      { role: "system", content: systemPrompt },
    ],
  });

  try {
    const text = response.choices[0]?.message?.content ?? '{"score":30,"temperature":"cold"}';
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return { score: parsed.score, temperature: parsed.temperature };
  } catch {
    return { score: 30, temperature: "cold" };
  }
}
