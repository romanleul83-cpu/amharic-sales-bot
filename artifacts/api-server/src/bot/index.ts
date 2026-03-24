import TelegramBot from "node-telegram-bot-api";
import { handleMessage } from "./handlers";
import { startScheduler } from "./scheduler";
import { logger } from "../lib/logger";

let bot: TelegramBot | null = null;

export function initBot(): TelegramBot {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN must be set.");
  }

  bot = new TelegramBot(token, { polling: true });

  bot.on("message", async (msg) => {
    try {
      await handleMessage(bot!, msg);
    } catch (err) {
      logger.error({ err, chatId: msg.chat.id }, "Error handling message");
    }
  });

  bot.on("polling_error", (err) => {
    logger.error({ err }, "Telegram polling error");
  });

  bot.on("error", (err) => {
    logger.error({ err }, "Telegram bot error");
  });

  startScheduler(bot);

  logger.info("Telegram bot initialized and polling");
  return bot;
}

export function getBot(): TelegramBot | null {
  return bot;
}
