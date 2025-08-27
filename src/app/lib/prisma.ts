// app/lib/prisma.ts
import { PrismaClient } from '@/lib/prisma-master';
import { PrismaClient as ProjectPrisma } from '@/lib/prisma-project';

// Global declaration to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  projectClients: Map<string, ProjectPrisma> | undefined;
};

// Master client
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Project clients cache
const projectClientsCache = globalForPrisma.projectClients ?? new Map<string, ProjectPrisma>();

export function getProjectPrismaClient(databaseUrl: string): ProjectPrisma {
  if (!projectClientsCache.has(databaseUrl)) {
    const client = new ProjectPrisma({
      datasources: { db: { url: databaseUrl } },
    });
    projectClientsCache.set(databaseUrl, client);
  }
  return projectClientsCache.get(databaseUrl)!;
}

// Store in global in development to prevent re-initialization
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.projectClients = projectClientsCache;
}