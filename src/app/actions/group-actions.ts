// app/actions/group-actions.ts
"use server";

import { getProjectPrismaClient } from "@/app/lib/prisma";
import { prismaMaster } from "@/app/lib/prisma";

type GroupLite = {
  id: string;
  name: string;
  createdAt: Date;
  
};

// Get groups for a project
export async function getGroups(projectId: number): Promise<GroupLite[]> {
  try {
    if (isNaN(projectId)) return [];

    const project = await prismaMaster.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return [];

    const projectPrisma = getProjectPrismaClient(project.databaseUrl);

    const groups = await projectPrisma.group.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return groups;
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    return [];
  }
}

// Create a new group
export async function createGroup(
  projectId: number,
  formData: FormData
): Promise<{ success: boolean; error?: string; group?: GroupLite }> {
  try {
    const name = formData.get("name") as string;
    if (!name?.trim()) return { success: false, error: "Name is required" };
    if (isNaN(projectId))
      return { success: false, error: "Invalid project ID" };

    const project = await prismaMaster.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return { success: false, error: "Project not found" };

    const projectPrisma = getProjectPrismaClient(project.databaseUrl);

    const group = await projectPrisma.group.create({
      data: { name: name.trim() },
    });

    return { success: true, group };
  } catch (error) {
    console.error("Failed to create group:", error);
    return { success: false, error: "Failed to create group" };
  }
}

// Update an existing group
export async function updateGroup(
  projectId: number,
  groupId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; group?: GroupLite }> {
  try {
    const name = formData.get("name") as string;
    if (!name?.trim()) return { success: false, error: "Name is required" };

    const project = await prismaMaster.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return { success: false, error: "Project not found" };

    const projectPrisma = getProjectPrismaClient(project.databaseUrl);

    const group = await projectPrisma.group.update({
      where: { id: groupId },
      data: { name: name.trim() },
    });

    // revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true, group };
  } catch (error) {
    console.error("Failed to update group:", error);
    return { success: false, error: "Failed to update group" };
  }
}

// Delete a group
export async function deleteGroup(
  projectId: number,
  groupId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const project = await prismaMaster.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return { success: false, error: "Project not found" };

    const projectPrisma = getProjectPrismaClient(project.databaseUrl);

    await projectPrisma.group.delete({
      where: { id: groupId },
    });

    // revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete group:", error);
    return { success: false, error: "Failed to delete group" };
  }
}
