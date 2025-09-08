import { PrismaClient } from "@prisma/client";

declare global {
 
  var prismaMaster: PrismaClient | undefined;
}

export const prismaMaster =
  global.prismaMaster ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL!, // master DB URL
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaMaster = prismaMaster;
}
