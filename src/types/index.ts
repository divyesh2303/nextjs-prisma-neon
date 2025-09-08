// src/types/index.ts
export interface Project {
  id: number;
  name: string;
  databaseUrl: string;
  createdAt: Date;
}

export type Group = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date; // <-- required
};

export interface CreateProjectRequest {
  name: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
// src/types/index.ts

export interface Project {
  id: number;
  name: string;
  databaseUrl: string;
  createdAt: Date;
}

export interface Task {
  id: number | string; // string if from Prisma UUID, number if DB auto-increment
  title: string;
  description?: string | null;
  status: "todo" | "in-progress" | "done" | "error";
  priority?: "low" | "medium" | "high";
  groupId: string;
  position?: number; // useful for drag & drop ordering
}

export interface CreateProjectRequest {
  name: string;
  // databaseUrl?: string; // only add if client needs to send it
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
