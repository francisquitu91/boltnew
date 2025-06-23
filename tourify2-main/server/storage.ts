import { tours, scenes, users, type Tour, type Scene, type InsertTour, type InsertScene, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods (existing)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tour methods
  getTour(id: number): Promise<Tour | undefined>;
  createTour(tour: InsertTour): Promise<Tour>;
  updateTour(id: number, tour: Partial<InsertTour>): Promise<Tour | undefined>;
  deleteTour(id: number): Promise<boolean>;
  
  // Scene methods
  getScenes(tourId: number): Promise<Scene[]>;
  getScene(id: number): Promise<Scene | undefined>;
  createScene(scene: InsertScene): Promise<Scene>;
  updateScene(id: number, scene: Partial<InsertScene>): Promise<Scene | undefined>;
  deleteScene(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tours: Map<number, Tour>;
  private scenes: Map<number, Scene>;
  private currentUserId: number;
  private currentTourId: number;
  private currentSceneId: number;

  constructor() {
    this.users = new Map();
    this.tours = new Map();
    this.scenes = new Map();
    this.currentUserId = 1;
    this.currentTourId = 1;
    this.currentSceneId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Tour methods
  async getTour(id: number): Promise<Tour | undefined> {
    return this.tours.get(id);
  }

  async createTour(insertTour: InsertTour): Promise<Tour> {
    const id = this.currentTourId++;
    const tour: Tour = { 
      ...insertTour, 
      id,
      description: insertTour.description || null
    };
    this.tours.set(id, tour);
    return tour;
  }

  async updateTour(id: number, tourUpdate: Partial<InsertTour>): Promise<Tour | undefined> {
    const existingTour = this.tours.get(id);
    if (!existingTour) return undefined;
    
    const updatedTour = { ...existingTour, ...tourUpdate };
    this.tours.set(id, updatedTour);
    return updatedTour;
  }

  async deleteTour(id: number): Promise<boolean> {
    // Also delete all scenes in this tour
    const scenesToDelete = Array.from(this.scenes.values())
      .filter(scene => scene.tourId === id);
    scenesToDelete.forEach(scene => this.scenes.delete(scene.id));
    
    return this.tours.delete(id);
  }

  // Scene methods
  async getScenes(tourId: number): Promise<Scene[]> {
    return Array.from(this.scenes.values())
      .filter(scene => scene.tourId === tourId);
  }

  async getScene(id: number): Promise<Scene | undefined> {
    return this.scenes.get(id);
  }

  async createScene(insertScene: InsertScene): Promise<Scene> {
    const id = this.currentSceneId++;
    const scene: Scene = { ...insertScene, id, markers: insertScene.markers || [] };
    this.scenes.set(id, scene);
    return scene;
  }

  async updateScene(id: number, sceneUpdate: Partial<InsertScene>): Promise<Scene | undefined> {
    const existingScene = this.scenes.get(id);
    if (!existingScene) return undefined;
    
    const updatedScene = { ...existingScene, ...sceneUpdate };
    this.scenes.set(id, updatedScene);
    return updatedScene;
  }

  async deleteScene(id: number): Promise<boolean> {
    return this.scenes.delete(id);
  }
}

export const storage = new MemStorage();
