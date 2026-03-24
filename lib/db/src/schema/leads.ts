import { pgTable, text, serial, integer, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadStatusEnum = pgEnum("lead_status", ["new", "qualifying", "qualified", "presented", "follow_up", "hot", "cold", "converted"]);
export const leadTempEnum = pgEnum("lead_temperature", ["hot", "warm", "cold"]);

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  status: leadStatusEnum("status").notNull().default("new"),
  temperature: leadTempEnum("temperature"),
  qualificationScore: integer("qualification_score").default(0),
  answers: text("answers"), // JSON stringified
  stage: text("stage").notNull().default("greeting"),
  followUpCount: integer("follow_up_count").default(0),
  lastFollowUpAt: timestamp("last_follow_up_at"),
  notifiedAdmin: integer("notified_admin").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;

export const conversationMessagesTable = pgTable("conversation_messages", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConversationMessageSchema = createInsertSchema(conversationMessagesTable).omit({ id: true, createdAt: true });
export type InsertConversationMessage = z.infer<typeof insertConversationMessageSchema>;
export type ConversationMessage = typeof conversationMessagesTable.$inferSelect;

export const mediaFilesTable = pgTable("media_files", {
  id: serial("id").primaryKey(),
  fileId: text("file_id").notNull(),
  fileType: text("file_type").notNull(), // "photo" | "video" | "document"
  category: text("category").notNull(), // "testimony" | "compensation" | "presentation" | "rank_reward" | "package" | "general"
  description: text("description").notNull(),
  tags: text("tags"), // comma-separated keywords
  addedBy: text("added_by"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaFileSchema = createInsertSchema(mediaFilesTable).omit({ id: true, createdAt: true });
export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;
export type MediaFile = typeof mediaFilesTable.$inferSelect;
