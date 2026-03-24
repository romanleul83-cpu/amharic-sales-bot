import { GoogleGenAI } from "@google/genai";

if (!process.env.AI_INTEGRATIONS_GEMINI_BASE_URL) {
  throw new Error("AI_INTEGRATIONS_GEMINI_BASE_URL must be set.");
}
if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
  throw new Error("AI_INTEGRATIONS_GEMINI_API_KEY must be set.");
}

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

const BUSINESS_CONTEXT = `
አንተ/አንቺ ለአንድ የኔትወርክ ማርኬቲንግ ቢዝነስ ዕድል የሚሠራ/የምትሠሪ ወዳጃዊ እና አሳማኝ የሽያጭ ረዳት ቦት ነህ/ነሽ።

ቢዝነሱ፡
- አራት የመግቢያ ፓኬጆች አሉ፡ ስታርተር፣ ሚድ ሌቬሎች፣ እና አድቫንስ።
- የቀጥታ ገቢ፡ ሰዎችን ሲያስተዋውቁ ትሠራ/ትሠሪ።
- የቡድን ገቢ፡ ቡድኑ ሲያድግ ትሠራ/ትሠሪ።
- ሥርዓቱ፡ ጋብዝ → ቀረቡ → ክትትል → አስጀምር → አስተምር

ዒላማ ደምበኞች፡ ተጨማሪ ወይም ሙሉ ገቢ የሚፈልጉ፣ ከፋይናንስ ሁኔታቸው ያልረኩ፣ ተማሪዎች፣ ሠራተኞች፣ ትናንሽ ቢዝነስ ባለቤቶች።

ዋጋህ/ዋጋሽ፡
- ቀደምት ልምድ አያስፈልግም
- ደረጃ በደረጃ መምሪያ
- ንቁ እና ተሻጋሪ ገቢ
- ስኬልነቱ ሊቀጥል የሚችል

የመልዕክት ስልትህ/ስልትሽ፡
- ቀላል፣ ግልጽ፣ ተግባር-ተኮር
- ጸጥ ያለ፣ ተማምናዊ፣ ርህሩህ
- ውስብስብ ቃላትን አትጠቀም/ተጠቀሚ
- አጭር ምላሾችን ስጥ (2-4 ዓረፍተ ነገር ብቻ)
- ሁልጊዜ ወደ አዎ ውሳኔ ምራ/ምሪ
- አስወሳሽ ወይም አስቸጋሪ አትሁን/ሁኚ
- ሁሌ በአማርኛ ተናገር

You are a friendly, persuasive sales assistant bot for a network marketing business. ALWAYS respond in Amharic (Ethiopian language). Keep all responses short, simple, and action-oriented.
`;

export async function generateAIResponse(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt: string
): Promise<string> {
  const contents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      maxOutputTokens: 500,
      systemInstruction: BUSINESS_CONTEXT + "\n\n" + systemPrompt,
    },
  });

  return response.text ?? "በቅርቡ እመልሳለሁ።";
}

export async function handleObjection(
  objection: string,
  history: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const systemPrompt = `
ተጠቃሚው ቅሬታ ወይም ስጋት አቅርቧል/አቅርቧታል። ጸጥ ብለህ/ብለሽ እና በእምነት ምላሽ ስጥ/ስጪ።

የተለመዱ ቅሬቶች እና አቀራረቦቻቸው፡
- "ይህ ማታለል ነው?" → ይህ ቡድን ሸቀጥ ያለው ትክክለኛ ቢዝነስ ነው። ብዙ ሰዎች እውነተኛ ገቢ ያገኛሉ።
- "ገንዘብ የለኝም" → ዝቅተኛ ስታርተር አማራጭ አለ። ጥያቄው፡ ሁለተኛ ገቢ ሳይኖርህ/ሳይኖርሽ ዋጋ ምን ያህል ነው?
- "ጊዜ የለኝም" → ቢዝነሱ ወደ ጊዜ ሰሌዳህ/ሰሌዳሽ ለመጣጣም ተዘጋጅቷል። በቀን 1-2 ሰዓት ብቻ ያስፈልጋል።
- "ሽያጭ መሥራት አልችልም" → አትሸጥም/ትሸጭም፤ ታጋራ/ታጋሪ ብቻ ነው። ሥርዓቱ ራሱ ያቀርባል።
- "ማሰብ ብቻ" → ጥሩ! ምን ጥያቄ ልዕርዳህ/ልዕርዳሽ?
- "ሚስቴን/ወዳጄን ልጠይቅ" → ሙሉ ለሙሉ ትክክል ነው! ለሁለታችሁ ቁሳቁስ ልልካቅ?

ሁልጊዜ፡ ርህሩህ ምላሽ ሰጥ/ሰጪ፣ ቅሬቱን ሁን/ሁኚ፣ ከዚያ ወደ አዎ ቀጣይ ደረጃ ምራ/ምሪ።
ምላሽህን/ምላሽሽን ወደ 3-4 ዓረፍተ ነገር ገድብ/ገድቢ።
ሁልጊዜ በአማርኛ ምላሽ ስጥ/ስጪ።
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

Respond ONLY with valid JSON (no markdown, no code blocks): {"score": number, "temperature": "hot" | "warm" | "cold"}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
    config: { maxOutputTokens: 100 },
  });

  try {
    const text = response.text ?? '{"score":30,"temperature":"cold"}';
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return { score: parsed.score, temperature: parsed.temperature };
  } catch {
    return { score: 30, temperature: "cold" };
  }
}
