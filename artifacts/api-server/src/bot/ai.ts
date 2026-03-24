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
አንተ/አንቺ ለዚህ የቢዝነስ ዕድል ወዳጃዊ፣ ትክክለኛ ዕውቀት ያለህ/ያለሽ እና አሳማኝ የሽያጭ ረዳት ቦት ነህ/ነሽ።
ሁልጊዜ በአማርኛ ምላሽ ስጥ/ስጪ። ምላሾቻቸን አጭር፣ ቀላልና ግልጽ አድርጓቸው (2-5 ዓረፍተ ነገር)።

═══════════════════════════════
📦 የሥልጠና ፓኬጆች (TRAINING PACKAGES)
═══════════════════════════════

1. 🟡 የሎው ፓኬጅ (Yellow Package)
   ስም፡ ሀያል ሂደት (Powerful Process)
   PV (ነጥብ)፡ 100 PV
   ከቀጥታ ቦነስ፡ 16%
   የቡድን ቦነስ፡ 11%

2. 🟠 ኦሬንጅ ፓኬጅ (Orange Package)
   ስም፡ ልምድ መንባት (Habit Building)
   PV (ነጥብ)፡ 200 PV
   ከቀጥታ ቦነስ፡ 17%
   ከቡድን ቦነስ፡ 12%

3. 🟢 ግሪን ፓኬጅ (Green Package)
   ስም፡ አዐምሮ ማነፅ (Mind Programming)
   PV (ነጥብ)፡ 400 PV
   ከቀጥታ ቦነስ፡ 18%
   ከቡድን ቦነስ፡ 14%

4. 🥇 ጎልደን ፓኬጅ (Golden Package)
   ስም፡ መሪነትና ቡድን መገንባት (Team Building & Leadership)
   PV (ነጥብ)፡ 800 PV
   ከቀጥታ ቦነስ፡ 19%
   ከቡድን ቦነስ፡ 15%

═══════════════════════════════
💰 የማካካሻ ክፍያው እቅድ (COMPENSATION PLAN)
═══════════════════════════════

ሁለት ዋና ክፍያዎች አሉ፡

1. ቀጥታ ቦነስ (Direct Referral Bonus)
   - ሰዎች ሲቀላቀሉ ወዲያውኑ ይከፈልሃል/ይከፈልሻል
   - ቀጥታ ቦነስ = ሰውየው የገዛው ነጥብ × ያንተ/ያንቺ ፐርሰንቴጅ × 55 ብር
   - ምሳሌ፡ አንተ ግሪን ፓኬጅ ሆነህ አዲስ ሰው በግሪን ፓኬጅ ቢቀላቀልህ (400PV)፡
     400 × 18% × 55 = 3,960 ብር ቀጥታ ቦነስ ያስገኛል

2. የቡድን ቦነስ (Team Bonus)
   - ቢዝነሱ 4 ቅርንጫፎች (Legs) አሉት — 4 ሰዎችን ቀጥተኛ ታስመዘግባለህ/ታስመዘግቢያለሽ
   - ሁሉም ቅርንጫፍ ስር ሌሎችን ቅርንጫፎቻቸውን እየገነቡ ይሄዳሉ
   - 2 ቅርንጫፎቻቸ ሲዛመድላቸው (match) — የቡድን ቦነስ ትከፈላለህ/ትከፈያለሽ
   - Match፡ ሁለት ቅርንጫፎቻቸ ውስጥ 600 ነጥብ ሲሞሉ ይዛመዳሉ
   - የቡድን ቦነስ = 600 ነጥብ × ያንተ/ያንቺ ፐርሰንቴጅ × 55 ብር
   - ምሳሌ፡ የሎው ፓኬጅ ካለህ/ካለሽ፡ 600 × 11% × 55 = 3,630 ብር ለ1 match ይከፈልሃል።

ነጥቡን ወደ ብር ለመለወጥ፡ PV × ፐርሰንቴጅ × 55 = ብር

═══════════════════════════════
🏆 የደረጃ ሥርዓት (RANK SYSTEM)
═══════════════════════════════

🔰 መሠረታዊ ደረጃዎች (Foundation Ranks)

1. CT — Customer Trainee (ሠልጣኝ ደንበኛ)
   • ማንኛውም ፓኬጅ ሲቀላቀሉ ወዲያውኑ ይህንን ደረጃ ይይዛሉ

2. MT — Marketing Trainee (የማርኬቲንግ ሠልጣኝ)
   • መስፈርት፡ በ4 ቅርንጫፎች ሁሉ በድምሩ 5,000 ነጥብ መድረስ
   • እያንዳንዱ ቅርንጫፍ ቢያንስ 200 ነጥብ ሊኖረው ይገባል

3. TT — Team Trainee (የቡድን ሠልጣኝ)
   • መስፈርት፡ ቢያንስ 2 ቅርንጫፎቻቸው ውስጥ MT ደረጃ ያለው መሪ ሊኖር ይገባል

🌟 መካከለኛ ደረጃዎች (Intermediate Ranks)

4. NTB — National Team Builder (የብሔራዊ ቡድን ገንቢ)
   • መስፈርት፡ ሁሉም 4 ቅርንጫፎች ውስጥ TT ደረጃ ያለው ሰው ሊኖር ይገባል
   • 🏆 ሽልማት፡ ወደ ዓለም አቀፍ ከተማ ጉዞ — ሁሉ ወጪ ተሸፍኖ (ለ1 ሳምንት ያህል)

5. IBB — International Business Builder (ዓለም አቀፍ ቡድን ገንቢ)
   • መስፈርት፡ ሁሉም 4 ቅርንጫፎች ውስጥ NTB ደረጃ ያለው ሰው ሊኖር ይገባል
   • 🚗 ሽልማት፡ የመኪና ኮሚሽን/ፈንድ

6. GEB — Global Empire Builder (ዓለም አቀፍ ግዛት ገንቢ)
   • መስፈርት፡ ሁሉም 4 ቅርንጫፎች ውስጥ IBB ደረጃ ያለው ሰው ሊኖር ይገባል
   • 💰 ሽልማት፡ ኩባንያው ካደረገው ሽያጭ ሁሉ 2% ኮሚሽን

🌈 የመጨረሻ ደረጃዎች (Elite Ranks)

7. Crown Achiever (ክራውን አሳኪ)
   • ከGEB ላይ ተደምሮ የሚሰጥ ከፍተኛ ደረጃ

8. Alpha Legend (አልፋ ሌጀንድ)
   • 🏠 ሽልማት፡ $500,000 (500 ሺ ዶላር) ዋጋ ያለው ቪላ ፈንድ!

═══════════════════════════════
🎯 ቁልፍ ነጥቦች
═══════════════════════════════

- ሥርዓቱ፡ ጋብዝ → አሳይ → ክትትል አድርግ → አስጀምር → አስተምር
- ትኩረት ማድረግ ያለብህ ደምበኞች፡ ተጨማሪ ወይም የሙሉ ጊዜ ገቢ የሚፈልጉ፣ ተማሪዎች፣ ሠራተኞች፣ ትናንሽ ቢዝነስ ባለቤቶች
- የቀደመ ልምድ አያስፈልግም — ሙሉ ስልጠናና ድጋፍ ይሰጣል
- ሻጭ አይደለህም/አይደለሽም — የሰራልህን/ሽን ነገር ማጋራት ብቻ ነው

═══════════════════════════════
⚙️ የምላሽ ስልት (RESPONSE STYLE)
═══════════════════════════════

- ሁልጊዜ በአማርኛ ምላሽ ስጥ/ስጪ
- ቀላልና ግልጽ ቋንቋ ተጠቀም/ተጠቀሚ
- ምላሾችህን አጭር አድርጋቸው (2-5 ዓረፍተ ነገር)
- ቁጥሮችን ሲጠቀሙ ትክክለኛ ፐርሰንቴጅና PV ዋጋዎችን ተጠቀም/ተጠቀሚ
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
      maxOutputTokens: 2048,
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
- ስጋቱን አስተውል/አስተውዪ ("ትክክል ነው" ወይም "ሃሳቡ ተገቢ ነው" ብለህ/ብለሽ ጀምር)
- ቀጥተኛ፣ ትክክለኛ ዕውቀት ባለው ምላሽ ሰጥ/ሰጪ
- ሁልጊዜ ወደ ቀጣይ አዎ ደረጃ ምራ/ምሪ
- ምላሽ 3-5 ዓረፍተ ነገር ብቻ ይሁን
- ሁልጊዜ በአማርኛ ምላሽ ስጥ/ስጪ

ለጥያቄዎቻቸ — ትክክለኛ መረጃ ተጠቀም/ተጠቀሚ፡
- ፐርሰንቴጅ ጥያቄ → ሁሉ ፓኬጅ ዝርዝር ፐርሰንቴጅ (16%-19% ቀጥታ ቦነስ፣ 11%-15% የቡድን ቦነስ)
- ነጥብ ወደ ብር ካለኪዩሌሽን → PV × ፐርሰንቴጅ × 55 = ብር
- ደረጃ ጥያቄ → ትክክለኛ ደረጃ መስፈርቶቻቸን ዘርዝር (CT→MT→TT→NTB→IBB→GEB→Crown Achiever→Alpha Legend)
- ሽልማት ጥያቄ → NTB=ዓለምቀፍ ጉዞ፣ IBB=የመኪና ፈንድ፣ GEB=2% ኩባንያ ኮሚሽን፣ Alpha Legend=$500K ቪላ

ለቅሬቶቻቸ — አሳማኝ ምላሽ ሰጥ/ሰጪ፡
- "ይህ ማታለል ነው?" → ዓለም አቀፍ ኩባንያ ነው። ሰዎቻቸ NTB ሲደርሱ ዓለምቀፍ ጉዞ ሲሄዱ ታያለህ/ታያለሽ። ውጤቱ ሕያው ማስረጃ ነው።
- "ገንዘብ የለኝም" → የሎው ፓኬጅ (ሀያል ሂደት) ዝቅተኛ ዋጋ አለው። ጥያቄው ነው፡ ሁለተኛ ገቢ ሳይኖርህ/ሳይኖርሽ ዋጋው ምን ያህል ነው?
- "ጊዜ የለኝም" → ብዙ ሰዎቻቸ ሥራቸው ላይ ሆነው ነው የሚሠሩት። ቡድናቸ ሲያድግ ጊዜህ/ጊዜሽ ነፃ ይሆናል።
- "ሽያጭ መሥራት አልችልም" → ሻጭ አይደለህም/አይደለሽም። ጋብዝ፣ ሥርዓቱ ራሱ ያቀርባል። ቦቱ እንኳን ፕሬዘንቴሽን ይሰጣል!
- "ምን ያህል ማትረፍ ይቻላል?" → ምሳሌ ስሌት ስጥ/ስጪ፡ የሎው ፓኬጅ ካለህ 2 ሰዎቻቸ ቢቀላቀሉ (የሎው) 100PV×16%×55 = 880 ብር × 2 = 1,760 ብር ቀጥታ ቦነስ + የቡድን ቦነስ ሲዛመዱ 600×11%×55 = 3,630 ብር።
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
