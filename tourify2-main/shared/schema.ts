import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const scenes = pgTable("scenes", {
  id: serial("id").primaryKey(),
  tourId: integer("tour_id").notNull(),
  name: text("name").notNull(),
  panorama: text("panorama").notNull(),
  markers: jsonb("markers").default([]),
});

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
});

export const insertSceneSchema = createInsertSchema(scenes).omit({
  id: true,
});

export type InsertTour = z.infer<typeof insertTourSchema>;
export type Tour = typeof tours.$inferSelect;
export type InsertScene = z.infer<typeof insertSceneSchema>;
export type Scene = typeof scenes.$inferSelect;

// For backwards compatibility with the requirements
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
