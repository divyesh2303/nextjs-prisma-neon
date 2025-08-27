// lib/actions/project-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { createNeonProject } from '@/app/lib/neon';
import { initializeProjectDatabase } from '@/app/lib/project-init';
import { neonApiClient } from '@/app/lib/neon-api';
import type { Project } from '@/types';

// Server action to get all projects
export async function getProjects(): Promise<Project[]> {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return projects;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to fetch projects');
  }
}

// Server action to get a single project by ID
export async function getProject(id: number): Promise<Project | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });
    return project;
  } catch (error) {
    console.error('Failed to fetch project:', error);
    throw new Error('Failed to fetch project');
  }
}

// Server action to create a new project
export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;

  if (!name?.trim()) {
    throw new Error('Project name is required');
  }

  try {
    // Create Neon project
    const { neonProjectId, databaseUrl } = await createNeonProject(name.trim());

    // Store in master database with neonProjectId
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        databaseUrl,
        neonProjectId, // Store the Neon project ID
      },
    });

    // Initialize project database with User table
    await initializeProjectDatabase(databaseUrl);

    // Revalidate the dashboard page to show the new project
    revalidatePath('/dashboard');
    
    return { success: true, project };
  } catch (error) {
    console.error('Project creation failed:', error);
    throw new Error('Failed to create project');
  }
}

// Server action to update a project
export async function updateProject(id: number, data: { name: string }) {
  if (!data.name?.trim()) {
    throw new Error('Project name is required');
  }

  try {
    // First get the project to extract Neon project ID
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Update the project name in Neon Console
    let neonProjectId: string;
    
    if (project.neonProjectId) {
      // If we have the neonProjectId stored, use it directly
      neonProjectId = project.neonProjectId;
    } else {
      // Extract from database URL (fallback method)
      neonProjectId = neonApiClient.extractProjectIdFromUrl(project.databaseUrl);
    }

    // Update in Neon Console
    await neonApiClient.updateProject(neonProjectId, { name: data.name.trim() });

    // Update in local database
    const updatedProject = await prisma.project.update({
      where: { id },
      data: { name: data.name.trim() },
    });

    // Revalidate the dashboard page
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/projects/${id}`);
    
    return { success: true, project: updatedProject };
  } catch (error) {
    console.error('Project update failed:', error);
    throw new Error(`Failed to update project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Server action to delete a project
export async function deleteProject(id: number) {
  try {
    // First get the project to extract Neon project ID
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Delete the project from Neon Console
    let neonProjectId: string;
    
    if (project.neonProjectId) {
      // If we have the neonProjectId stored, use it directly
      neonProjectId = project.neonProjectId;
    } else {
      // Extract from database URL (fallback method)
      neonProjectId = neonApiClient.extractProjectIdFromUrl(project.databaseUrl);
    }

    // Delete from Neon Console first
    await neonApiClient.deleteProject(neonProjectId);

    // Delete from local database
    await prisma.project.delete({
      where: { id },
    });

    // Revalidate the dashboard page
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Project deletion failed:', error);
    throw new Error(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}