import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { getLeadsForFollowUp, getUnnotifiedHotLeads, updateLead } from "./leadService";
import { MESSAGES } from "./messages";
import { logger } from "../lib/logger";

export function startScheduler(bot: TelegramBot): void {
  // Run every hour to check for follow-ups needed
  cron.schedule("0 * * * *", async () => {
    logger.info("Running follow-up scheduler...");
    await sendFollowUps(bot);
    await notifyHotLeads(bot);
  });

  logger.info("Follow-up scheduler started");
}

async function sendFollowUps(bot: TelegramBot): Promise<void> {
  const leads = await getLeadsForFollowUp();

  for (const lead of leads) {
    try {
      const chatId = parseInt(lead.telegramId, 10);
      const followUpCount = lead.followUpCount ?? 0;

      let message: string;
      if (followUpCount === 0) {
        message = MESSAGES.warmFollowUp1;
      } else if (followUpCount === 1) {
        message = MESSAGES.warmFollowUp2;
      } else if (followUpCount === 2) {
        message = MESSAGES.warmFollowUp3;
      } else {
        await updateLead(lead.telegramId, { status: "cold", temperature: "cold", stage: "cold" });
        continue;
      }

      await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      await updateLead(lead.telegramId, {
        followUpCount: followUpCount + 1,
        lastFollowUpAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info({ telegramId: lead.telegramId, followUpCount: followUpCount + 1 }, "Follow-up sent");
    } catch (err) {
      logger.error({ err, telegramId: lead.telegramId }, "Failed to send follow-up");
    }
  }
}

async function notifyHotLeads(bot: TelegramBot): Promise<void> {
  const adminId = process.env.TELEGRAM_ADMIN_ID;
  if (!adminId) return;

  const hotLeads = await getUnnotifiedHotLeads();

  for (const lead of hotLeads) {
    try {
      const notificationText = MESSAGES.adminNotification(lead);
      await bot.sendMessage(adminId, notificationText, { parse_mode: "Markdown" });
      await updateLead(lead.telegramId, { notifiedAdmin: 1 });
      logger.info({ telegramId: lead.telegramId }, "Hot lead admin notification sent");
    } catch (err) {
      logger.error({ err, telegramId: lead.telegramId }, "Failed to notify admin for hot lead");
    }
  }
}
