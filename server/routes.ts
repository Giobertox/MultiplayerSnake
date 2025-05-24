import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameScoreSchema, insertGameResultSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Game score routes
  app.post("/api/scores", async (req, res) => {
    try {
      const scoreData = insertGameScoreSchema.parse(req.body);
      const score = await storage.saveGameScore(scoreData);
      res.json(score);
    } catch (error) {
      console.log(`Error saving score: ${error}`);
      res.status(400).json({ error: "Invalid score data" });
    }
  });

  app.get("/api/scores/top", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const scores = await storage.getTopScores(limit);
      res.json(scores);
    } catch (error) {
      console.log(`Error fetching top scores: ${error}`);
      res.status(500).json({ error: "Failed to fetch scores" });
    }
  });

  // Game result routes
  app.post("/api/games", async (req, res) => {
    try {
      const gameData = insertGameResultSchema.parse(req.body);
      const game = await storage.saveGameResult(gameData);
      res.json(game);
    } catch (error) {
      console.log(`Error saving game result: ${error}`);
      res.status(400).json({ error: "Invalid game data" });
    }
  });

  app.get("/api/games/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const games = await storage.getRecentGames(limit);
      res.json(games);
    } catch (error) {
      console.log(`Error fetching recent games: ${error}`);
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
