import { users, gameScores, gameResults, type User, type InsertUser, type GameScore, type InsertGameScore, type GameResult, type InsertGameResult } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveGameScore(score: InsertGameScore): Promise<GameScore>;
  saveGameResult(result: InsertGameResult): Promise<GameResult>;
  getTopScores(limit?: number): Promise<GameScore[]>;
  getRecentGames(limit?: number): Promise<GameResult[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async saveGameScore(insertScore: InsertGameScore): Promise<GameScore> {
    const [score] = await db
      .insert(gameScores)
      .values(insertScore)
      .returning();
    return score;
  }

  async saveGameResult(insertResult: InsertGameResult): Promise<GameResult> {
    const [result] = await db
      .insert(gameResults)
      .values(insertResult)
      .returning();
    return result;
  }

  async getTopScores(limit: number = 10): Promise<GameScore[]> {
    return await db
      .select()
      .from(gameScores)
      .orderBy(desc(gameScores.score))
      .limit(limit);
  }

  async getRecentGames(limit: number = 10): Promise<GameResult[]> {
    return await db
      .select()
      .from(gameResults)
      .orderBy(desc(gameResults.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
