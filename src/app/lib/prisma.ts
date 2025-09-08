// src/app/lib/prisma.ts
import { PrismaClient as MasterPrismaClient } from "@/lib/prisma-master";
import { PrismaClient as ProjectPrismaClient } from "@/lib/prisma-project";

const globalForPrisma = globalThis as unknown as {
  prismaMaster?: MasterPrismaClient;
  projectClients?: Map<string, ProjectPrismaClient>;
};

// --- Master DB Client (single instance) ---
export const prismaMaster =
  globalForPrisma.prismaMaster ?? new MasterPrismaClient();

// --- Project Clients Cache (multi-tenant) ---
const projectClientsCache =
  globalForPrisma.projectClients ?? new Map<string, ProjectPrismaClient>();

export function getProjectPrismaClient(
  databaseUrl: string
): ProjectPrismaClient {
  if (!projectClientsCache.has(databaseUrl)) {
    const client = new ProjectPrismaClient({
      datasources: { db: { url: databaseUrl } },
    });
    projectClientsCache.set(databaseUrl, client);
  }
  return projectClientsCache.get(databaseUrl)!;
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaMaster = prismaMaster;
  globalForPrisma.projectClients = projectClientsCache;
}
