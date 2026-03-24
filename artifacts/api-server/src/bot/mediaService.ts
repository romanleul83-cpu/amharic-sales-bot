import { db, mediaFilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import type { MediaFile, InsertMediaFile } from "@workspace/db";

export async function getAllActiveMedia(): Promise<MediaFile[]> {
  return db.select().from(mediaFilesTable).where(eq(mediaFilesTable.active, true));
}

export async function getMediaById(id: number): Promise<MediaFile | null> {
  const results = await db.select().from(mediaFilesTable).where(eq(mediaFilesTable.id, id)).limit(1);
  return results[0] ?? null;
}

export async function addMedia(data: InsertMediaFile): Promise<MediaFile> {
  const [media] = await db.insert(mediaFilesTable).values(data).returning();
  return media;
}

export async function deleteMedia(id: number): Promise<void> {
  await db.update(mediaFilesTable).set({ active: false }).where(eq(mediaFilesTable.id, id));
}

export async function listMedia(): Promise<MediaFile[]> {
  return db.select().from(mediaFilesTable).where(eq(mediaFilesTable.active, true));
}
