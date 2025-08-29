// lib/project-init.ts
import { execSync } from "child_process";

export async function initializeProjectDatabase(
  databaseUrl: string
): Promise<void> {
  console.log("🔧 Initializing project database...");
  console.log("📍 Database URL:", databaseUrl.replace(/:([^:@]+)@/, ":****@")); // Hide password in logs

  try {
    // Run Prisma migration
    console.log("🚀 Running Prisma migration...");

    try {
      execSync(
        `npx prisma db push  --schema=prisma-project/projectSchema.prisma`,
        {
          stdio: "inherit",
          env: {
            ...process.env,
            PROJECT_DATABASE_URL: databaseUrl,
          },
        }
      );

      console.log("✅ Database migration completed successfully");
    } catch (pushError) {
      console.log("⚠️ Schema migration failed...", pushError);
    }
  } catch (error) {
    console.error("❌ Failed to initialize project database:", error);
  } finally {
    console.error(
      "Migration performed for creating the USER table in DB of newly created Neon Project"
    );
  }
}
