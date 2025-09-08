import type {
  Status as PrismaStatus,
  Priority as PrismaPriority,
} from "@/lib/prisma-project";
export type Status = PrismaStatus;
export type Priority = PrismaPriority;

export interface Project {
  id: number;
  name: string;
  databaseUrl: string;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: number | string; // string if from Prisma UUID, number if DB auto-increment
  title: string;
  description?: string | null;
  status: Status;
  priority?: Priority;
  groupId: string;
  position?: number; // useful for drag & drop ordering
}

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
