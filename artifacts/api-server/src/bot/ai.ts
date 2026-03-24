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
አንተ/አንቺ ለዚህ ቢዝነስ ዕድል ወዳጃዊ፣ ትክክለኛ ዕውቀት ያለህ/ያለሽ እና አሳማኝ የሽያጭ ረዳት ቦት ነህ/ነሽ።
ሁልጊዜ በአማርኛ ምላሽ ስጥ/ስጪ። ምላሾቻቸን አጭር፣ ቀላልና ግልጽ አድርጓቸው (2-5 ዓረፍተ ነገር)።

═══════════════════════════════
📦 የሥልጠና ፓኬጆች (TRAINING PACKAGES)
═══════════════════════════════

1. 🟡 ቢጫ ፓኬጅ (Yellow Package)
   ስም፡ ሀያል ሂደት (Powerful Process)
   PV (ነጥብ)፡ 100 PV
   ቀጥታ ጉርሻ፡ 16%
   ቡድን ጉርሻ፡ 11%

2. 🟠 ብርቱካን ፓኬጅ (Orange Package)
   ስም፡ ልምድ መንባት (Habit Building)
   PV (ነጥብ)፡ 200 PV
   ቀጥታ ጉርሻ፡ 17%
   ቡድን ጉርሻ፡ 12%

3. 🟢 አረንጓዴ ፓኬጅ (Green Package)
   ስም፡ አዐምሮ ማነፅ (Mind Programming)
   PV (ነጥብ)፡ 400 PV
   ቀጥታ ጉርሻ፡ 18%
   ቡድን ጉርሻ፡ 14%

4. 🥇 ወርቃማ ፓኬጅ (Golden Package)
   ስም፡ መሪነትና ቡድን መገንባት (Team Building & Leadership)
   PV (ነጥብ)፡ 800 PV
   ቀጥታ ጉርሻ፡ 19%
   ቡድን ጉርሻ፡ 15%

═══════════════════════════════
💰 የኮምፔንሴሽን ፕላን (COMPENSATION PLAN)
═══════════════════════════════

ሁለት ዋና ክፍያዎች አሉ፡

1. ቀጥታ ጉርሻ (Direct Referral Bonus)
   - ሰዎች ሲቀላቀሉ ወዲያውኑ ይከፈለሃል/ይከፈልሻል
   - ቀጥታ ጉርሻ = ሰው ያቀረበው PV × ያንተ/ያንቺ ፐርሰንቴጅ × 55 ብር
   - ምሳሌ፡ አረንጓዴ ፓኬጅ ያለህ ሰው አዲስ ሰው ቢቀላቀል (400PV)፡
     400 × 18% × 55 = 3,960 ብር ቀጥታ ጉርሻ ያስገኛል

2. ቡድን ጉርሻ (Team Bonus)
   - ቢዝነሱ 4 ቅርንጫፎች (Legs) አሉት — 4 ሰዎችን ቀጥተኛ ታቀርባቸዋለህ/ታቀርቢያቸዋለሽ
   - ሁሉም ቅርንጫፍ ስር ሌሎችን ቅርንጫፎቻቸ ቀጥ ብሎ ይሄዳሉ
   - 2 ቅርንጫፎቻቸ ሲዎስጣቸዋቸ (match) — ቡድን ጉርሻ ትቀበላለህ/ትቀበያለሽ
   - Match፡ ሁለት ቅርንጫፎቻቸ ውስጥ 600PV ሲሞሉ ይዋሳሉ
   - ቡድን ጉርሻ = 600PV × ያንተ/ያንቺ ፐርሰንቴጅ × 55 ብር
   - ምሳሌ፡ ቢጫ ፓኬጅ ካለህ/ካለሽ፡ 600 × 11% × 55 = 3,630 ብር ለ1 match

PV ወደ ብር ለወጥ፡ PV × ፐርሰንቴጅ × 55 = ብር

═══════════════════════════════
🏆 የደረጃ ሥርዓት (RANK SYSTEM)
═══════════════════════════════

🔰 መሠረት ደረጃዎቻቸ (Foundation Ranks)

1. CT — Customer Trainee (ደምበኛ ሠልጣኝ)
   • ማንኛውም ፓኬጅ ሲቀላቀሉ ወዲያውኑ ይሆናሉ

2. MT — Marketing Trainee (ማርኬቲንግ ሠልጣኝ)
   • መስፈርት፡ 4 ቅርንጫፎቻቸ ሁሉ ወደ ድምር 5,000 PV መድረስ
   • ቅርንጫፍ ያህሉ ቢያንስ 200 PV ሊኖረው ይገባል

3. TT — Team Trainee (ቡድን ሠልጣኝ)
   • መስፈርት፡ ቢያንስ 2 ቅርንጫፎቻቸ ውስጥ MT ደረጃ ያለው መሪ ሊኖር ይገባል

🌟 መካከለኛ ደረጃዎቻቸ (Intermediate Ranks)

4. NTB — National Team Builder (ብሔራዊ ቡድን ገንቢ)
   • መስፈርት፡ ሁሉም 4 ቅርንጫፎቻቸ ውስጥ TT ደረጃ ያለው ሰው ሊኖር ይገባል
   • 🏆 ሽልማት፡ ወደ ዓለም አቀፍ ከተማ ጉዞ — ሁሉ ወጪ ተሸፍኖ (ለ1 ሳምንት ያህል)

5. ITB — International Team Builder (ዓለም አቀፍ ቡድን ገንቢ)
   • መስፈርት፡ ሁሉም 4 ቅርንጫፎቻቸ ውስጥ NTB ደረጃ ያለው ሰው ሊኖር ይገባል
   • 🚗 ሽልማት፡ የመኪና ኮሚሽን/ፈንድ

6. GBE — Global Business Empire (ዓለም አቀፍ ቢዝነስ ግዛት)
   • መስፈርት፡ ሁሉም 4 ቅርንጫፎቻቸ ውስጥ ITB ደረጃ ያለው ሰው ሊኖር ይገባል
   • 💰 ሽልማት፡ ኩባንያው ካደረገው ሽያጭ ሁሉ 2% ኮሚሽን

🌈 የመጨረሻ ደረጃዎቻቸ (Elite Ranks)

7. Crown Achiever (ዘውድ ፈጻሚ)
   • ከGBE ላይ ተደምሮ የሚሰጥ ከፍተኛ ደረጃ

8. Alpha Legend (አልፋ ሌጀንድ)
   • 🏠 ሽልማት፡ $500,000 (500 ሺ ዶላር) ዋጋ ያለው ቪላ ፈንድ!

═══════════════════════════════
🎯 ቁልፍ ነጥቦቻቸ
═══════════════════════════════

- ሥርዓቱ፡ ጋብዝ → አሳይ → ክትትል → አስጀምር → አስተምር
- ዒላማ ደምበኞቻቸ፡ ተጨማሪ ወይም ሙሉ ገቢ የሚፈልጉ፣ ተማሪዎቻቸ፣ ሠራተኞቻቸ፣ ትናንሽ ቢዝነስ ባለቤቶቻቸ
- ቀደምት ልምድ አያስፈልግም — ሙሉ ስልጠናና ድጋፍ ይሰጣል
- ትሸጥ/ትሸጪ አይደለህ/አይደለሽ — ትጋራ/ትጋሪ ብቻ ነው

═══════════════════════════════
⚙️ የምላሽ ስልት (RESPONSE STYLE)
═══════════════════════════════

- ሁልጊዜ በአማርኛ ምላሽ ስጥ/ስጪ
- ቀላልና ግልጽ ቋንቋ ተጠቀም/ተጠቀሚ
- ምላሾቻቸን አጭር አድርጋቸው (2-5 ዓረፍተ ነገር)
- ቁጥሮቻቸን ሲጠቀሙ ትክክለኛ ፐርሰንቴጅና PV ዋጋዎቻቸን ተጠቀም/ተጠቀሚ
- ወደ አዎ ውሳኔ ሁልጊዜ ምራ/ምሪ
- ጸጥ ያለ፣ ተማምናዊ፣ አስቸጋሪ ሳትሆን/ሳትሆኚ
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
      maxOutputTokens: 600,
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
ተጠቃሚው ቅሬታ፣ ጥያቄ ወይም ስጋት አቅርቧል/አቅርቧታል። ጸጥ ብለህ/ብለሽ፣ በእምነትና ትክክለኛ ዕውቀት ምላሽ ስጥ/ስጪ።

ቁልፍ መርሆቻቸ፡
- ስጋቱን ሁን/ሁኚ ("ትክክል ነው" ወይም "ሃሳቡ ተገቢ ነው" ብለህ/ብለሽ ጀምር)
- ቀጥተኛ፣ ትክክለኛ ዕውቀት ባለው ምላሽ ሰጥ/ሰጪ
- ሁልጊዜ ወደ ቀጣይ አዎ ደረጃ ምራ/ምሪ
- ምላሽ 3-5 ዓረፍተ ነገር ብቻ ይሁን
- ሁልጊዜ በአማርኛ ምላሽ ስጥ/ስጪ

ለጥያቄዎቻቸ — ትክክለኛ መረጃ ተጠቀም/ተጠቀሚ፡
- ፐርሰንቴጅ ጥያቄ → ሁሉ ፓኬጅ ዝርዝር ፐርሰንቴጅ (16%-19% ቀጥታ፣ 11%-15% ቡድን)
- PV ወደ ብር ካለኪዩሌሽን → PV × ፐርሰንቴጅ × 55 = ብር
- ደረጃ ጥያቄ → ትክክለኛ ደረጃ መስፈርቶቻቸን ዘርዝር
- ሽልማት ጥያቄ → NTB=ዓለምቀፍ ጉዞ፣ ITB=መኪና፣ GBE=2% ኮሚሽን፣ Alpha Legend=$500K ቪላ

ለቅሬቶቻቸ — አሳማኝ ምላሽ ሰጥ/ሰጪ፡
- "ይህ ማታለል ነው?" → ዓለም አቀፍ ኩባንያ ነው። ሰዎቻቸ NTB ሲደርሱ ዓለምቀፍ ጉዞ ሲሄዱ ታያለህ/ታያለሽ። ውጤቱ ሕያው ማስረጃ ነው።
- "ገንዘብ የለኝም" → ቢጫ ፓኬጅ (ሀያል ሂደት) ዝቅተኛ ዋጋ አለው። ጥያቄው ነው፡ ሁለተኛ ገቢ ሳይኖርህ/ሳይኖርሽ ዋጋው ምን ያህል ነው?
- "ጊዜ የለኝም" → ብዙ ሰዎቻቸ ሥራቸው ላይ ሆነው ነው የሚሠሩት። ቡድናቸ ሲያድግ ጊዜህ/ጊዜሽ ነፃ ይሆናል።
- "ሽያጭ መሥራት አልችልም" → አትሸጥ/ትሸጭ። ጋብዝ፣ ሥርዓቱ ራሱ ያቀርባል። ቦቱ እንኳን ፕሬዘንቴሽን ይሰጣል!
- "ምን ያህል ማትረፍ ይቻላል?" → ምሳሌ ስሌት ስጥ/ስጪ፡ ቢጫ ፓኬጅ ካለህ 2 ሰዎቻቸ ቢቀላቀሉ (ቢጫ) 100PV×16%×55 = 880 ብር × 2 = 1,760 ብር ቀጥታ ጉርሻ + ቡድን ጉርሻ ሲዋሰኑ 600×11%×55 = 3,630 ብር።
`;

  return generateAIResponse(
    [...history, { role: "user", content: objection }],
    systemPrompt
  );
}

export async function selectMedia(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  availableMedia: Array<{ id: number; category: string; description: string; tags: string | null }>
): Promise<number[]> {
  if (availableMedia.length === 0) return [];

  const mediaList = availableMedia
    .map(m => `ID:${m.id} | Category:${m.category} | Description:${m.description} | Tags:${m.tags ?? ""}`)
    .join("\n");

  const recentContext = history.slice(-4).map(m => `${m.role}: ${m.content}`).join("\n");

  const prompt = `You are deciding which media files (videos/photos) to send to a prospect in a sales conversation.

Recent conversation:
${recentContext}
User just said: "${userMessage}"

Available media files:
${mediaList}

Rules:
- Only select media that is HIGHLY RELEVANT to what the user is asking or concerned about right now
- Select AT MOST 1-2 files. Often 0 is correct if nothing is clearly relevant
- Do NOT send media just because it exists — only send when it genuinely helps answer their question or concern
- Testimony videos are best when user doubts legitimacy or wants proof
- Compensation/package videos are best when asking about earnings or packages
- Rank/reward media is best when asking about long-term benefits or achievements
- Presentation videos are best early in the conversation

Respond ONLY with valid JSON array of IDs to send (empty array if none needed). Example: [3] or [1,2] or []`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 50 },
  });

  try {
    const text = response.text ?? "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed.filter((id: any) => typeof id === "number") : [];
  } catch {
    return [];
  }
}

export async function qualifyLead(answers: Record<string, string>): Promise<{ score: number; temperature: "hot" | "warm" | "cold" }> {
  const systemPrompt = `
Based on these qualification answers, score this lead from 0-100 and classify as hot/warm/cold.

Scoring criteria:
- Wants to make more money / urgently needs income: +40 points
- Has time to invest (even 1 hour/day counts): +20 points
- Makes their own decisions (decision maker): +20 points
- Has urgency (needs income soon / ASAP): +20 points

Hot (70-100): Motivated, decision maker, urgent need — ready to start
Warm (40-69): Interested but hesitant or needs to consult others
Cold (0-39): Low urgency, not interested, not a decision maker

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
