// lib/neon-api.ts
const NEON_API_BASE = "https://console.neon.tech/api/v2";

interface NeonProject {
  id: string;
  name: string;
  region_id: string;
  created_at: string;
  updated_at: string;
}

 
class NeonApiClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEON_API_KEY!;
    if (!this.apiKey) {
      throw new Error("NEON_API_KEY environment variable is required");
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${NEON_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Neon API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async getProject(projectId: string): Promise<NeonProject> {
    const response = await this.makeRequest<{ project: NeonProject }>(
      `/projects/${projectId}`
    );
    return response.project;
  }

  async updateProject(
    projectId: string,
    data: { name: string }
  ): Promise<NeonProject> {
    const response = await this.makeRequest<{ project: NeonProject }>(
      `/projects/${projectId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ project: data }),
      }
    );
    return response.project;
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.makeRequest(`/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  async listProjects(): Promise<NeonProject[]> {
    const response = await this.makeRequest<{ projects: NeonProject[] }>(
      "/projects"
    );
    return response.projects;
  }

 
  extractProjectIdFromUrl(databaseUrl: string): string {
    
    const match = databaseUrl.match(
      /ep-[a-z0-9-]+\.([a-z0-9-]+\.){2}neon\.tech/
    );
    if (!match) {
      throw new Error("Could not extract Neon project ID from database URL");
    }

 
    const endpoint = match[0];
    return endpoint.split(".")[0];  
  }
}

export const neonApiClient = new NeonApiClient();
