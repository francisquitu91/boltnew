import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTourSchema, insertSceneSchema } from "../shared/schema.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Tour routes
  app.get("/api/tours/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tour = await storage.getTour(id);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tour" });
    }
  });

  app.post("/api/tours", async (req, res) => {
    try {
      const tourData = insertTourSchema.parse(req.body);
      const tour = await storage.createTour(tourData);
      res.status(201).json(tour);
    } catch (error) {
      res.status(400).json({ message: "Invalid tour data" });
    }
  });

  // Scene routes
  app.get("/api/tours/:tourId/scenes", async (req, res) => {
    try {
      const tourId = parseInt(req.params.tourId);
      const scenes = await storage.getScenes(tourId);
      res.json(scenes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get scenes" });
    }
  });

  app.post("/api/tours/:tourId/scenes", async (req, res) => {
    try {
      const tourId = parseInt(req.params.tourId);
      const sceneData = insertSceneSchema.parse({
        ...req.body,
        tourId,
      });
      const scene = await storage.createScene(sceneData);
      res.status(201).json(scene);
    } catch (error) {
      res.status(400).json({ message: "Invalid scene data" });
    }
  });

  app.put("/api/scenes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sceneData = req.body;
      const scene = await storage.updateScene(id, sceneData);
      if (!scene) {
        return res.status(404).json({ message: "Scene not found" });
      }
      res.json(scene);
    } catch (error) {
      res.status(500).json({ message: "Failed to update scene" });
    }
  });

  app.delete("/api/scenes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteScene(id);
      if (!deleted) {
        return res.status(404).json({ message: "Scene not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete scene" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
