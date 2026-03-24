import { db, leadsTable } from "@workspace/db";
import { eq, gte, sql, and } from "drizzle-orm";

export interface BotStats {
  totalUsers: number;
  todayNewUsers: number;
  hot: number;
  warm: number;
  cold: number;
  qualifying: number;
  presented: number;
  converted: number;
}

export async function getBotStats(): Promise<BotStats> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalsRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leadsTable);

  const [todayRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leadsTable)
    .where(gte(leadsTable.createdAt, startOfDay));

  const tempRows = await db
    .select({ temperature: leadsTable.temperature, count: sql<number>`count(*)` })
    .from(leadsTable)
    .groupBy(leadsTable.temperature);

  const statusRows = await db
    .select({ status: leadsTable.status, count: sql<number>`count(*)` })
    .from(leadsTable)
    .groupBy(leadsTable.status);

  const byTemp: Record<string, number> = {};
  for (const row of tempRows) {
    byTemp[row.temperature ?? "unknown"] = Number(row.count);
  }

  const byStatus: Record<string, number> = {};
  for (const row of statusRows) {
    byStatus[row.status] = Number(row.count);
  }

  return {
    totalUsers: Number(totalsRow?.count ?? 0),
    todayNewUsers: Number(todayRow?.count ?? 0),
    hot: byTemp["hot"] ?? 0,
    warm: byTemp["warm"] ?? 0,
    cold: byTemp["cold"] ?? 0,
    qualifying: byStatus["qualifying"] ?? 0,
    presented: byStatus["presented"] ?? 0,
    converted: byStatus["converted"] ?? 0,
  };
}

export function formatStatsMessage(stats: BotStats): string {
  return `📊 *የቦት ስታቲስቲክስ (Bot Statistics)*

👥 *ጠቅላላ ተጠቃሚዎቻቸ፡* ${stats.totalUsers}
📅 *ዛሬ የተቀላቀሉ፡* ${stats.todayNewUsers}

🌡️ *በሙቀት ደረጃ፡*
🔥 ሞቃት (Hot)፡ ${stats.hot}
🟡 ሞቅ (Warm)፡ ${stats.warm}
🔵 ቀዝቀዝ (Cold)፡ ${stats.cold}

📋 *በሂደት ደረጃ፡*
❓ በቁጥር ምዘና ላይ፡ ${stats.qualifying}
📺 ፕሬዘንቴሽን ያዩ፡ ${stats.presented}
✅ ቀርቦ ተቀልቅሎ ነኝ፡ ${stats.converted}`;
}
