import TelegramBot from "node-telegram-bot-api";
import { MESSAGES } from "./messages";
import { getOrCreateLead, getLead, updateLead, saveMessage, getConversationHistory } from "./leadService";
import { handleObjection, qualifyLead } from "./ai";
import { logger } from "../lib/logger";

export async function handleMessage(bot: TelegramBot, msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;
  const telegramId = String(msg.from?.id ?? chatId);
  const text = (msg.text ?? "").trim();
  const adminId = process.env.TELEGRAM_ADMIN_ID;

  if (!text || text === "/start") {
    await handleStart(bot, chatId, telegramId, msg);
    return;
  }

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
      await sendAndSave(bot, chatId, telegramId, "I hope you reconsider someday! If you ever want to revisit, just type /start. Wishing you the best! 🌟");
      break;
    default:
      await handlePostPresentation(bot, chatId, telegramId, text, lead);
  }
}

async function handleStart(bot: TelegramBot, chatId: number, telegramId: string, msg: TelegramBot.Message): Promise<void> {
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
    await updateLead(telegramId, {
      stage: "cold",
      status: "cold",
      temperature: "cold",
      answers: JSON.stringify(answers),
    });
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

  await new Promise(r => setTimeout(r, 2000));

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

  if (lower === "yes" || lower.includes("ready") || lower.includes("start") || lower.includes("interested") || lower.includes("let's go") || lower.includes("sign me up")) {
    await updateLead(telegramId, { stage: "hot", status: "qualified", temperature: "hot" });
    await sendAndSave(bot, chatId, telegramId, MESSAGES.readyToConnect);
    await notifyAdmin(bot, telegramId);
    return;
  }

  if (lower.includes("no") || lower.includes("not interested") || lower.includes("forget")) {
    await updateLead(telegramId, { stage: "cold", status: "cold", temperature: "cold" });
    await sendAndSave(bot, chatId, telegramId, MESSAGES.coldLead);
    return;
  }

  const history = await getConversationHistory(telegramId, 8);
  const response = await handleObjection(text, history);
  await saveMessage(telegramId, "assistant", response);
  await bot.sendMessage(chatId, response, { parse_mode: "Markdown" });

  if (!lead.temperature || lead.temperature === "cold") {
    await updateLead(telegramId, { stage: "follow_up", status: "follow_up", temperature: "warm" });
  }
}

async function handleFollowUpResponse(bot: TelegramBot, chatId: number, telegramId: string, text: string, lead: any): Promise<void> {
  const lower = text.toLowerCase();

  if (lower === "yes" || lower.includes("ready") || lower.includes("start") || lower.includes("interested")) {
    await updateLead(telegramId, { stage: "hot", status: "qualified", temperature: "hot" });
    await sendAndSave(bot, chatId, telegramId, MESSAGES.readyToConnect);
    await notifyAdmin(bot, telegramId);
    return;
  }

  if (lower.includes("no") || lower.includes("not interested") || lower.includes("stop")) {
    await updateLead(telegramId, { stage: "cold", status: "cold", temperature: "cold" });
    await sendAndSave(bot, chatId, telegramId, MESSAGES.coldLead);
    return;
  }

  const history = await getConversationHistory(telegramId, 8);
  const response = await handleObjection(text, history);
  await saveMessage(telegramId, "assistant", response);
  await bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
}

async function handleHotLeadResponse(bot: TelegramBot, chatId: number, telegramId: string, text: string): Promise<void> {
  const lower = text.toLowerCase();
  if (lower === "yes" || lower.includes("ready") || lower.includes("yes")) {
    await sendAndSave(bot, chatId, telegramId, MESSAGES.readyToConnect);
    await notifyAdmin(bot, telegramId);
  } else {
    const history = await getConversationHistory(telegramId, 6);
    const response = await handleObjection(text, history);
    await saveMessage(telegramId, "assistant", response);
    await bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
  }
}

async function notifyAdmin(bot: TelegramBot, telegramId: string): Promise<void> {
  const adminId = process.env.TELEGRAM_ADMIN_ID;
  if (!adminId) return;

  const lead = await getLead(telegramId);
  if (!lead) return;

  if (lead.notifiedAdmin === 1) return;

  try {
    const notificationText = MESSAGES.adminNotification(lead);
    await bot.sendMessage(adminId, notificationText, { parse_mode: "Markdown" });
    await updateLead(telegramId, { notifiedAdmin: 1 });
    logger.info({ telegramId, adminId }, "Admin notified of hot lead");
  } catch (err) {
    logger.error({ err, telegramId }, "Failed to notify admin");
  }
}

async function sendAndSave(bot: TelegramBot, chatId: number, telegramId: string, text: string): Promise<void> {
  await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  await saveMessage(telegramId, "assistant", text);
}
