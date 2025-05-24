import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  score: integer("score").notNull(),
  gameTime: integer("game_time").notNull(), // in seconds
  playerCount: integer("player_count").notNull(),
  foodEaten: integer("food_eaten").notNull(),
  powerupsUsed: integer("powerups_used").notNull(),
  gameMode: text("game_mode").notNull().default("classic"), // classic, survival, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull(), // unique identifier for each game session
  totalPlayers: integer("total_players").notNull(),
  gameDuration: integer("game_duration").notNull(), // in seconds
  totalFoodEaten: integer("total_food_eaten").notNull(),
  totalPowerupsUsed: integer("total_powerups_used").notNull(),
  winnerName: text("winner_name"),
  playerScores: json("player_scores"), // array of player results
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const gameScoresRelations = relations(gameScores, ({ many }) => ({
  gameResults: many(gameResults),
}));

export const gameResultsRelations = relations(gameResults, ({ many }) => ({
  scores: many(gameScores),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameScoreSchema = createInsertSchema(gameScores).pick({
  playerName: true,
  score: true,
  gameTime: true,
  playerCount: true,
  foodEaten: true,
  powerupsUsed: true,
  gameMode: true,
});

export const insertGameResultSchema = createInsertSchema(gameResults).pick({
  gameId: true,
  totalPlayers: true,
  gameDuration: true,
  totalFoodEaten: true,
  totalPowerupsUsed: true,
  winnerName: true,
  playerScores: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameResult = z.infer<typeof insertGameResultSchema>;
export type GameResult = typeof gameResults.$inferSelect;
