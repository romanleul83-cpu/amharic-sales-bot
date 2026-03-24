import TelegramBot from "node-telegram-bot-api";
import { MESSAGES } from "./messages";
import { getOrCreateLead, getLead, updateLead, saveMessage, getConversationHistory } from "./leadService";
import { handleObjection, qualifyLead, selectMedia } from "./ai";
import { getAllActiveMedia, addMedia, listMedia, deleteMedia, getMediaById } from "./mediaService";
import { getBotStats, formatStatsMessage } from "./statsService";
import { logger } from "../lib/logger";

const adminId = process.env.TELEGRAM_ADMIN_ID ?? "";

// In-memory state: admin pending media upload { category, description }
const pendingMediaUpload = new Map<string, { category: string; description: string }>();

// In-memory state: media offered to a user but not yet sent
const pendingMediaOffer = new Map<string, number[]>();

function isAdmin(telegramId: string): boolean {
  return telegramId === adminId;
}

// ─── Main Entry Point ──────────────────────────────────────────────────────

export async function handleMessage(bot: TelegramBot, msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;
  const telegramId = String(msg.from?.id ?? chatId);
  const text = (msg.text ?? "").trim();

  // Handle media uploads from admin
  if (isAdmin(telegramId) && (msg.photo || msg.video || msg.document)) {
    await handleAdminMediaUpload(bot, chatId, telegramId, msg);
    return;
  }

  // Handle commands
  if (text.startsWith("/")) {
    await handleCommand(bot, chatId, telegramId, text, msg);
    return;
  }

  // Regular user flow
  if (!text) return;

  const lead = await getLead(telegramId);
  if (!lead) {
    await handleStart(bot, chatId, telegramId, msg);
    return;
  }

  await saveMessage(telegramId, "user", text);

  switch (lead.stage) {
    case "greeting":
      await handleNameInput(bot, chatId, telegramId, text);
      break;
    case "ask_goal":
      await handleGoalInput(bot, chatId, telegramId, text, lead);
      break;
    case "ask_time":
      await handleTimeInput(bot, chatId, telegramId, text, lead);
      break;
    case "ask_decision":
      await handleDecisionInput(bot, chatId, telegramId, text, lead);
      break;
    case "ask_urgency":
      await handleUrgencyInput(bot, chatId, telegramId, text, lead);
      break;
    case "presented":
      await handlePostPresentation(bot, chatId, telegramId, text, lead);
      break;
    case "follow_up":
      await handleFollowUpResponse(bot, chatId, telegramId, text, lead);
      break;
    case "hot":
      await handleHotLeadResponse(bot, chatId, telegramId, text);
      break;
    case "cold":
      await sendAndSave(bot, chatId, telegramId, MESSAGES.coldLead);
      break;
    default:
      await handlePostPresentation(bot, chatId, telegramId, text, lead);
  }
}

// ─── Command Router ────────────────────────────────────────────────────────

async function handleCommand(
  bot: TelegramBot,
  chatId: number,
  telegramId: string,
  text: string,
  msg: TelegramBot.Message
): Promise<void> {
  const [cmd, ...args] = text.split(" ");

  if (cmd === "/start") {
    await handleStart(bot, chatId, telegramId, msg);
    return;
  }

  // Admin-only commands
  if (!isAdmin(telegramId)) {
    if (cmd !== "/start") {
      await bot.sendMessage(chatId, MESSAGES.greeting, { parse_mode: "Markdown" });
    }
    return;
  }

  switch (cmd) {
    case "/stats":
      await handleStatsCommand(bot, chatId);
      break;
    case "/addmedia":
      await handleAddMediaCommand(bot, chatId, telegramId, args);
      break;
    case "/listmedia":
      await handleListMediaCommand(bot, chatId);
      break;
    case "/deletemedia":
      await handleDeleteMediaCommand(bot, chatId, args);
      break;
    case "/help":
      await sendAdminHelp(bot, chatId);
      break;
    default:
      await sendAdminHelp(bot, chatId);
  }
}

// ─── Admin Commands ────────────────────────────────────────────────────────

async function handleStatsCommand(bot: TelegramBot, chatId: number): Promise<void> {
  try {
    const stats = await getBotStats();
    const message = formatStatsMessage(stats);
    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (err) {
    logger.error({ err }, "Failed to get stats");
    await bot.sendMessage(chatId, "❌ ስታቲስቲክስ ለማምጣት አልተቻለም።");
  }
}

async function handleAddMediaCommand(
  bot: TelegramBot,
  chatId: number,
  telegramId: string,
  args: string[]
): Promise<void> {
  const validCategories = ["testimony", "compensation", "presentation", "rank_reward", "package", "general"];

  if (args.length < 2) {
    await bot.sendMessage(
      chatId,
      `❗ አጠቃቀም፡ \`/addmedia <category> <description>\`

ምድቦቻቸ፡
• \`testimony\` — የደምበኛ ምስክርነቶቻቸ / ስኬት ታሪኮቻቸ
• \`compensation\` — ስለ ክፍያ ፕላን ማብራሪያዎቻቸ
• \`presentation\` — ቢዝነስ ፕሬዘንቴሽን ቪዲዮዎቻቸ/ፎቶዎቻቸ
• \`rank_reward\` — ደረጃ ሽልማቶቻቸ፣ ጉዞ ፎቶዎቻቸ፣ መኪናዎቻቸ
• \`package\` — ፓኬጅ ማብራሪያዎቻቸ
• \`general\` — አጠቃላይ ተነሳሽነቶቻቸ

ምሳሌ፡ \`/addmedia testimony አቶ ከበደ NTB ደረሰ ዓለምቀፍ ጉዞ ሄደ\``,
      { parse_mode: "Markdown" }
    );
    return;
  }

  const category = args[0].toLowerCase();
  if (!validCategories.includes(category)) {
    await bot.sendMessage(chatId, `❌ ትክክለኛ ምድብ አይደለም። ከዚህ አንዱን ይምረጡ፡ ${validCategories.join(", ")}`);
    return;
  }

  const description = args.slice(1).join(" ");
  pendingMediaUpload.set(telegramId, { category, description });

  await bot.sendMessage(
    chatId,
    `✅ ዝግጁ ነኝ!\n\n📁 *ምድብ፡* ${category}\n📝 *ማብራሪያ፡* ${description}\n\nአሁን ፋይሉን (ፎቶ ወይም ቪዲዮ) ላኩ። ❗ 60 ሰኮንድ ጊዜ አለህ።`,
    { parse_mode: "Markdown" }
  );

  // Auto-cancel after 60 seconds
  setTimeout(() => {
    if (pendingMediaUpload.has(telegramId)) {
      pendingMediaUpload.delete(telegramId);
      bot.sendMessage(chatId, "⏰ ጊዜ አልፏል። እንደ ገና /addmedia ሞክር።").catch(() => {});
    }
  }, 60000);
}

async function handleListMediaCommand(bot: TelegramBot, chatId: number): Promise<void> {
  try {
    const media = await listMedia();
    if (media.length === 0) {
      await bot.sendMessage(chatId, "📭 ምንም ሚዲያ አልተጨመረም።");
      return;
    }

    const grouped: Record<string, typeof media> = {};
    for (const m of media) {
      if (!grouped[m.category]) grouped[m.category] = [];
      grouped[m.category].push(m);
    }

    let message = `📚 *የሚዲያ ቤተ-መጻሕፍት (${media.length} ፋይሎቻቸ)*\n\n`;
    for (const [cat, items] of Object.entries(grouped)) {
      message += `*📂 ${cat.toUpperCase()}*\n`;
      for (const item of items) {
        message += `  🆔 \`${item.id}\` — ${item.description}`;
        if (item.tags) message += ` [${item.tags}]`;
        message += `\n`;
      }
      message += "\n";
    }
    message += `_ለመሰረዝ፡ /deletemedia <ID>_`;

    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (err) {
    logger.error({ err }, "Failed to list media");
    await bot.sendMessage(chatId, "❌ ሊዝቱን ማምጣት አልተቻለም።");
  }
}

async function handleDeleteMediaCommand(bot: TelegramBot, chatId: number, args: string[]): Promise<void> {
  const id = parseInt(args[0] ?? "");
  if (isNaN(id)) {
    await bot.sendMessage(chatId, "❗ አጠቃቀም፡ `/deletemedia <ID>`", { parse_mode: "Markdown" });
    return;
  }
  try {
    await deleteMedia(id);
    await bot.sendMessage(chatId, `✅ ሚዲያ #${id} ተሰርዟል።`);
  } catch (err) {
    logger.error({ err }, "Failed to delete media");
    await bot.sendMessage(chatId, "❌ መሰረዝ አልተቻለም።");
  }
}

async function sendAdminHelp(bot: TelegramBot, chatId: number): Promise<void> {
  await bot.sendMessage(
    chatId,
    `🤖 *Admin Commands*

📊 */stats* — የቦት ስታቲስቲክስ ይመልከቱ
➕ */addmedia <category> <description>* — አዲስ ሚዲያ ጨምሩ
📋 */listmedia* — ሁሉ ሚዲያ ይዘርዝሩ
🗑️ */deletemedia <id>* — ሚዲያ ይሰርዙ
❓ */help* — ይህ ምናሌ`,
    { parse_mode: "Markdown" }
  );
}

// ─── Admin Media Upload Handler ────────────────────────────────────────────

async function handleAdminMediaUpload(
  bot: TelegramBot,
  chatId: number,
  telegramId: string,
  msg: TelegramBot.Message
): Promise<void> {
  const pending = pendingMediaUpload.get(telegramId);
  if (!pending) {
    await bot.sendMessage(
      chatId,
      "ℹ️ ሚዲያ ለጨመሩ /addmedia ይጠቀሙ። ምሳሌ፡ `/addmedia testimony ደምበኛ ምስክርነት`",
      { parse_mode: "Markdown" }
    );
    return;
  }

  let fileId: string | null = null;
  let fileType: string | null = null;

  if (msg.photo && msg.photo.length > 0) {
    // Get the largest photo
    fileId = msg.photo[msg.photo.length - 1].file_id;
    fileType = "photo";
  } else if (msg.video) {
    fileId = msg.video.file_id;
    fileType = "video";
  } else if (msg.document) {
    fileId = msg.document.file_id;
    fileType = "document";
  }

  if (!fileId || !fileType) {
    await bot.sendMessage(chatId, "❌ ፎቶ፣ ቪዲዮ ወይም ዶኩሜንት ብቻ ይቀበላል።");
    return;
  }

  try {
    // Extract optional tags from caption
    const caption = msg.caption ?? "";
    const tags = caption.length > 0 ? caption : null;

    const saved = await addMedia({
      fileId,
      fileType,
      category: pending.category,
      description: pending.description,
      tags,
      addedBy: telegramId,
      active: true,
    });

    pendingMediaUpload.delete(telegramId);

    await bot.sendMessage(
      chatId,
      `✅ *ሚዲያ ተጨምሯል!*\n\n🆔 ID: \`${saved.id}\`\n📁 ምድብ: ${saved.category}\n📝 ማብራሪያ: ${saved.description}\n🏷️ ታጎቻቸ: ${tags ?? "የለም"}\n\nAI ይህን ፋይል ተጠቃሚዎቻቸ ጋር በራሱ ሙቀ ሲልካቸዋቸ ይሆናል።`,
      { parse_mode: "Markdown" }
    );

    logger.info({ fileId, fileType, category: pending.category }, "Media file added by admin");
  } catch (err) {
    logger.error({ err }, "Failed to save media file");
    await bot.sendMessage(chatId, "❌ ፋይሉን ማስቀመጥ አልተቻለም። እንደ ገና ሞክር።");
  }
}

// ─── User Conversation Handlers ───────────────────────────────────────────

async function handleStart(bot: TelegramBot, chatId: number, telegramId: string, msg: TelegramBot.Message): Promise<void> {
  if (isAdmin(telegramId)) {
    await sendAdminHelp(bot, chatId);
    return;
  }
  await getOrCreateLead(telegramId, {
    telegramId,
    username: msg.from?.username,
    firstName: msg.from?.first_name,
    lastName: msg.from?.last_name,
    stage: "greeting",
    status: "new",
  });
  await updateLead(telegramId, { stage: "greeting", status: "new" });
  await sendAndSave(bot, chatId, telegramId, MESSAGES.greeting);
}

async function handleNameInput(bot: TelegramBot, chatId: number, telegramId: string, name: string): Promise<void> {
  await updateLead(telegramId, { firstName: name, stage: "ask_goal", status: "qualifying" });
  await sendAndSave(bot, chatId, telegramId, MESSAGES.askGoal(name));
}

async function handleGoalInput(bot: TelegramBot, chatId: number, telegramId: string, text: string, lead: any): Promise<void> {
  const answers = lead.answers ? JSON.parse(lead.answers) : {};

  if (text === "3" || text.toLowerCase().includes("not interested")) {
    answers.goal = "Not interested";
    await updateLead(telegramId, { stage: "cold", status: "cold", temperature: "cold", answers: JSON.stringify(answers) });
    await sendAndSave(bot, chatId, telegramId, MESSAGES.coldLead);
    return;
  }

  answers.goal = text === "1" ? "Wants more income (urgent)" : text === "2" ? "Open to ideas" : text;
  await updateLead(telegramId, { stage: "ask_time", answers: JSON.stringify(answers) });
  await sendAndSave(bot, chatId, telegramId, MESSAGES.askTime);
}

async function handleTimeInput(bot: TelegramBot, chatId: number, telegramId: string, text: string, lead: any): Promise<void> {
  const answers = lead.answers ? JSON.parse(lead.answers) : {};
  answers.time = text === "1" ? "Less than 1 hour/day" : text === "2" ? "1-3 hours/day" : text === "3" ? "More than 3 hours/day" : text;
  await updateLead(telegramId, { stage: "ask_decision", answers: JSON.stringify(answers) });
  await sendAndSave(bot, chatId, telegramId, MESSAGES.askDecision);
}

async function handleDecisionInput(bot: TelegramBot, chatId: number, telegramId: string, text: string, lead: any): Promise<void> {
  const answers = lead.answers ? JSON.parse(lead.answers) : {};
  answers.decision = text === "1" ? "Makes own decisions" : text === "2" ? "Needs to consult others" : text;
  await updateLead(telegramId, { stage: "ask_urgency", answers: JSON.stringify(answers) });
  await sendAndSave(bot, chatId, telegramId, MESSAGES.askUrgency);
}

async function handleUrgencyInput(bot: TelegramBot, chatId: number, telegramId: string, text: string, lead: any): Promise<void> {
  const answers = lead.answers ? JSON.parse(lead.answers) : {};
  answers.urgency = text === "1" ? "ASAP" : text === "2" ? "Within months" : text === "3" ? "No rush" : text;

  await updateLead(telegramId, { answers: JSON.stringify(answers) });

  const qualification = await qualifyLead(answers);
  logger.info({ telegramId, qualification }, "Lead qualified");

  await updateLead(telegramId, {
    qualificationScore: qualification.score,
    temperature: qualification.temperature,
    stage: "presented",
    status: "presented",
  });

  await sendAndSave(bot, chatId, telegramId, MESSAGES.presentation);
  await new Promise(r => setTimeout(r, 1500));

  if (qualification.temperature === "hot") {
    await sendAndSave(bot, chatId, telegramId, MESSAGES.hotLead);
    await updateLead(telegramId, { stage: "hot", status: "qualified" });
    await notifyAdmin(bot, telegramId);
  } else {
    await updateLead(telegramId, { stage: "presented", status: "presented" });
  }
}

async function handlePostPresentation(bot: TelegramBot, chatId: number, telegramId: string, text: string, lead: any): Promise<void> {
  const lower = text.toLowerCase();

  // User confirming they want the offered media
  if (isMediaConfirmation(lower) && pendingMediaOffer.has(telegramId)) {
    await deliverOfferedMedia(bot, chatId, telegramId);
    return;
  }

  if (lower === "yes" || lower.includes("ready") || lower.includes("start") || lower.includes("interested") || lower.includes("let's go") || lower.includes("sign me up") || lower === "አዎ") {
    pendingMediaOffer.delete(telegramId);
    await updateLead(telegramId, { stage: "hot", status: "qualified", temperature: "hot" });
    await sendAndSave(bot, chatId, telegramId, MESSAGES.readyToConnect);
    await notifyAdmin(bot, telegramId);
    return;
  }

  if (lower.includes("not interested") || lower.includes("forget") || lower === "አልፈልግም") {
    pendingMediaOffer.delete(telegramId);
    await updateLead(telegramId, { stage: "cold", status: "cold", temperature: "cold" });
    await sendAndSave(bot, chatId, telegramId, MESSAGES.coldLead);
    return;
  }

  const history = await getConversationHistory(telegramId, 8);
  const [response, mediaIds] = await Promise.all([
    handleObjection(text, history),
    getRelevantMedia(text, history),
  ]);

  await saveMessage(telegramId, "assistant", response);
  await bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
  await offerMediaIfRelevant(bot, chatId, telegramId, mediaIds);

  if (!lead.temperature || lead.temperature === "cold") {
    await updateLead(telegramId, { stage: "follow_up", status: "follow_up", temperature: "warm" });
  }
}

async function handleFollowUpResponse(bot: TelegramBot, chatId: number, telegramId: string, text: string, lead: any): Promise<void> {
  const lower = text.toLowerCase();

  // User confirming they want the offered media
  if (isMediaConfirmation(lower) && pendingMediaOffer.has(telegramId)) {
    await deliverOfferedMedia(bot, chatId, telegramId);
    return;
  }

  if (lower === "yes" || lower.includes("ready") || lower.includes("start") || lower.includes("interested") || lower === "አዎ") {
    pendingMediaOffer.delete(telegramId);
    await updateLead(telegramId, { stage: "hot", status: "qualified", temperature: "hot" });
    await sendAndSave(bot, chatId, telegramId, MESSAGES.readyToConnect);
    await notifyAdmin(bot, telegramId);
    return;
  }

  if (lower.includes("not interested") || lower.includes("stop") || lower === "አልፈልግም") {
    pendingMediaOffer.delete(telegramId);
    await updateLead(telegramId, { stage: "cold", status: "cold", temperature: "cold" });
    await sendAndSave(bot, chatId, telegramId, MESSAGES.coldLead);
    return;
  }

  const history = await getConversationHistory(telegramId, 8);
  const [response, mediaIds] = await Promise.all([
    handleObjection(text, history),
    getRelevantMedia(text, history),
  ]);

  await saveMessage(telegramId, "assistant", response);
  await bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
  await offerMediaIfRelevant(bot, chatId, telegramId, mediaIds);
}

async function handleHotLeadResponse(bot: TelegramBot, chatId: number, telegramId: string, text: string): Promise<void> {
  const lower = text.toLowerCase();

  // User confirming they want the offered media
  if (isMediaConfirmation(lower) && pendingMediaOffer.has(telegramId)) {
    await deliverOfferedMedia(bot, chatId, telegramId);
    return;
  }

  if (lower === "yes" || lower.includes("ready") || lower === "አዎ") {
    pendingMediaOffer.delete(telegramId);
    await sendAndSave(bot, chatId, telegramId, MESSAGES.readyToConnect);
    await notifyAdmin(bot, telegramId);
  } else {
    const history = await getConversationHistory(telegramId, 6);
    const [response, mediaIds] = await Promise.all([
      handleObjection(text, history),
      getRelevantMedia(text, history),
    ]);
    await saveMessage(telegramId, "assistant", response);
    await bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
    await offerMediaIfRelevant(bot, chatId, telegramId, mediaIds);
  }
}

// ─── Media Helpers ─────────────────────────────────────────────────────────

function isMediaConfirmation(lower: string): boolean {
  return (
    lower === "ቪዲዮ" ||
    lower === "video" ||
    lower === "ፎቶ" ||
    lower === "photo" ||
    lower === "አዎ ልካህ" ||
    lower === "አዎ" ||
    lower.includes("ቪዲዮ ልካህ") ||
    lower.includes("ቪዲዮ ልኪ") ||
    lower.includes("ይልካህ") ||
    lower.includes("send video") ||
    lower.includes("ልካህ") ||
    lower.includes("ልኪ")
  );
}

async function getRelevantMedia(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }>
): Promise<number[]> {
  try {
    const allMedia = await getAllActiveMedia();
    if (allMedia.length === 0) return [];
    return selectMedia(userMessage, history, allMedia);
  } catch (err) {
    logger.error({ err }, "Failed to select media");
    return [];
  }
}

async function offerMediaIfRelevant(
  bot: TelegramBot,
  chatId: number,
  telegramId: string,
  mediaIds: number[]
): Promise<void> {
  if (mediaIds.length === 0) {
    pendingMediaOffer.delete(telegramId);
    return;
  }

  // Build a description of what will be sent
  const previews: string[] = [];
  for (const id of mediaIds) {
    const media = await getMediaById(id);
    if (media) {
      const icon = media.fileType === "video" ? "📹" : media.fileType === "photo" ? "🖼️" : "📄";
      previews.push(`${icon} ${media.description}`);
    }
  }

  if (previews.length === 0) return;

  // Store the offer
  pendingMediaOffer.set(telegramId, mediaIds);

  const offerText =
    `\n\n━━━━━━━━━━━━━\n` +
    `📎 *ከዚህ ጋር ተያያዥ ሚዲያ አለ፡*\n` +
    previews.map(p => `• ${p}`).join("\n") +
    `\n\n👉 ልካህ/ልኪ ፈልጋለህ/ፈልጋለሽ? *"ቪዲዮ"* ወይም *"ፎቶ"* ብለህ/ብለሽ ምላሽ ስጥ/ስጪ።`;

  await bot.sendMessage(chatId, offerText, { parse_mode: "Markdown" });
}

async function deliverOfferedMedia(bot: TelegramBot, chatId: number, telegramId: string): Promise<void> {
  const mediaIds = pendingMediaOffer.get(telegramId);
  pendingMediaOffer.delete(telegramId);
  if (!mediaIds || mediaIds.length === 0) return;

  for (const id of mediaIds) {
    try {
      const media = await getMediaById(id);
      if (!media) continue;

      await new Promise(r => setTimeout(r, 400));

      if (media.fileType === "photo") {
        await bot.sendPhoto(chatId, media.fileId, { caption: media.description });
      } else if (media.fileType === "video") {
        await bot.sendVideo(chatId, media.fileId, { caption: media.description });
      } else if (media.fileType === "document") {
        await bot.sendDocument(chatId, media.fileId, { caption: media.description });
      }

      logger.info({ chatId, mediaId: id, fileType: media.fileType }, "Media delivered to user");
    } catch (err) {
      logger.error({ err, mediaId: id }, "Failed to deliver media");
    }
  }

  await bot.sendMessage(
    chatId,
    "✅ ቪዲዮዎቹ/ፎቶዎቹ ደረሱህ/ደረሱሽ! ሌላ ጥያቄ ካለህ/ካለሽ ጠይቅ/ጠይቂ። 😊",
    { parse_mode: "Markdown" }
  );
}

// ─── Admin Notification ────────────────────────────────────────────────────

async function notifyAdmin(bot: TelegramBot, telegramId: string): Promise<void> {
  if (!adminId) return;

  const lead = await getLead(telegramId);
  if (!lead || lead.notifiedAdmin === 1) return;

  try {
    const notificationText = MESSAGES.adminNotification(lead);
    await bot.sendMessage(adminId, notificationText, { parse_mode: "Markdown" });
    await updateLead(telegramId, { notifiedAdmin: 1 });
    logger.info({ telegramId, adminId }, "Admin notified of hot lead");
  } catch (err) {
    logger.error({ err, telegramId }, "Failed to notify admin");
  }
}

// ─── Shared Helper ─────────────────────────────────────────────────────────

async function sendAndSave(bot: TelegramBot, chatId: number, telegramId: string, text: string): Promise<void> {
  await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  await saveMessage(telegramId, "assistant", text);
}
