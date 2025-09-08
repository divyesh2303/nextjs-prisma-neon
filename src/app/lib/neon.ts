// lib/neon.ts
interface CreateNeonProjectResponse {
  neonProjectId: string;
  databaseUrl: string;
  projectName: string;
}

export async function createNeonProject(
  name: string
): Promise<CreateNeonProjectResponse> {
  try {
    if (!process.env.NEON_API_KEY) {
      throw new Error("NEON_API_KEY environment variable is required");
    }

    if (!process.env.NEON_ORG_ID) {
      throw new Error(
        "NEON_ORG_ID environment variable is required. Get it from your Neon organization settings page."
      );
    }

    console.log("🚀 Creating Neon project:", name);

    
    const response = await fetch("https://console.neon.tech/api/v2/projects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEON_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        project: {
          name,
          org_id: process.env.NEON_ORG_ID,
          region_id: process.env.NEON_REGION_ID || "aws-us-east-1",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Neon API Error Response:", errorText);
      throw new Error(
        `Failed to create Neon project: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("✅ Neon project created successfully");

    const project = data.project;
    const defaultEndpoint = data.endpoints?.[0];
    const defaultDatabase = data.databases?.[0];
    const defaultRole = data.roles?.[0];  

    if (!defaultEndpoint || !defaultDatabase || !defaultRole) {
      console.error("Missing required data from Neon response:", {
        endpoint: !!defaultEndpoint,
        database: !!defaultDatabase,
        role: !!defaultRole,
      });
      throw new Error("Failed to get required data from Neon response");
    }

    console.log("📊 Project details:");
    console.log(`   Project ID: ${project.id}`);
    console.log(`   Endpoint: ${defaultEndpoint.host}`);
    console.log(`   Database: ${defaultDatabase.name}`);
    console.log(`   Role: ${defaultRole.name}`);

    
    const databaseUrl = `postgresql://${defaultRole.name}:${defaultRole.password}@${defaultEndpoint.host}/${defaultDatabase.name}?sslmode=require`;

    console.log("🔗 Database URL constructed successfully");

    return {
      neonProjectId: project.id,
      databaseUrl,
      projectName: project.name,
    };
  } catch (error) {
    console.error("❌ Error creating Neon project:", error);
    throw new Error(
      `Failed to create Neon project: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}



// Alternative function to get connection details separately
export async function getNeonProjectDetails(projectId: string) {
  try {
    if (!process.env.NEON_API_KEY) {
      throw new Error("NEON_API_KEY environment variable is required");
    }

    const response = await fetch(
      `https://console.neon.tech/api/v2/projects/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEON_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get project details: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting project details:", error);
    throw error;
  }
}
