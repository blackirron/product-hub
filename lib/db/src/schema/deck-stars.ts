import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const deckStarsTable = pgTable("deck_stars", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deckId: integer("deck_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("deck_stars_user_deck_unique").on(table.userId, table.deckId),
]);

export const insertDeckStarSchema = createInsertSchema(deckStarsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertDeckStar = z.infer<typeof insertDeckStarSchema>;
export type DeckStar = typeof deckStarsTable.$inferSelect;
