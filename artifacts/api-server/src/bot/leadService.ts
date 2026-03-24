import { db, leadsTable, conversationMessagesTable } from "@workspace/db";
import { eq, and, lt, lte, isNull, or, sql } from "drizzle-orm";
import type { Lead, InsertLead } from "@workspace/db";

export async function getOrCreateLead(telegramId: string, data: Partial<InsertLead>): Promise<Lead> {
  const existing = await db.select().from(leadsTable).where(eq(leadsTable.telegramId, telegramId)).limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [lead] = await db.insert(leadsTable).values({
    telegramId,
    ...data,
  }).returning();

  return lead;
}

export async function getLead(telegramId: string): Promise<Lead | null> {
  const results = await db.select().from(leadsTable).where(eq(leadsTable.telegramId, telegramId)).limit(1);
  return results[0] ?? null;
}

export async function updateLead(telegramId: string, data: Partial<InsertLead>): Promise<Lead> {
  const [updated] = await db
    .update(leadsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(leadsTable.telegramId, telegramId))
    .returning();
  return updated;
}

export async function saveMessage(telegramId: string, role: "user" | "assistant", content: string): Promise<void> {
  await db.insert(conversationMessagesTable).values({ telegramId, role, content });
}

export async function getConversationHistory(telegramId: string, limit = 10): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  const messages = await db
    .select()
    .from(conversationMessagesTable)
    .where(eq(conversationMessagesTable.telegramId, telegramId))
    .orderBy(sql`${conversationMessagesTable.createdAt} DESC`)
    .limit(limit);

  return messages.reverse().map(m => ({ role: m.role as "user" | "assistant", content: m.content }));
}

export async function getLeadsForFollowUp(): Promise<Lead[]> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);

  const leads = await db
    .select()
    .from(leadsTable)
    .where(
      and(
        eq(leadsTable.status, "follow_up"),
        or(
          and(
            eq(leadsTable.followUpCount, 0),
            lte(leadsTable.updatedAt, oneDayAgo)
          ),
          and(
            eq(leadsTable.followUpCount, 1),
            lte(leadsTable.updatedAt, twoDaysAgo)
          ),
          and(
            eq(leadsTable.followUpCount, 2),
            lte(leadsTable.updatedAt, threeDaysAgo)
          )
        )
      )
    );

  return leads;
}

export async function getUnnotifiedHotLeads(): Promise<Lead[]> {
  return db
    .select()
    .from(leadsTable)
    .where(
      and(
        eq(leadsTable.temperature, "hot"),
        eq(leadsTable.notifiedAdmin, 0)
      )
    );
}
