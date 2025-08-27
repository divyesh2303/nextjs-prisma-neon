// app/actions/user-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { getProjectPrismaClient } from '@/app/lib/prisma';
import type { User, CreateUserRequest } from '@/types';

// Get users for a project
export async function getUsers(projectId: number): Promise<User[]> {
  try {
    if (isNaN(projectId)) {
      return [];
    }

    const project = await prisma.project.findUnique({ 
      where: { id: projectId } 
    });
    
    if (!project) {
      return [];
    }

    const projectPrisma = getProjectPrismaClient(project.databaseUrl);
    const users = await projectPrisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return users;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

// Create a new user
export async function createUser(
  projectId: number, 
  formData: FormData
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    if (!name?.trim() || !email?.trim()) {
      return { success: false, error: 'Name and email are required' };
    }

    if (isNaN(projectId)) {
      return { success: false, error: 'Invalid project ID' };
    }

    // Get project from master DB
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return { success: false, error: 'Project not found' };
    }

    const projectPrisma = getProjectPrismaClient(project.databaseUrl);

    // Check if email already exists
    const existingUser = await projectPrisma.user.findUnique({
      where: { email: email.trim() }
    });

    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Create user
    const user = await projectPrisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
      },
    });

    // Revalidate the project page to show updated data
    revalidatePath(`/dashboard/projects/${projectId}`);
    
    return { success: true, user };
  } catch (error) {
    console.error('Failed to create user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

// Update an existing user
export async function updateUser(
  projectId: number,
  userId: number,
  formData: FormData
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    if (!name?.trim() || !email?.trim()) {
      return { success: false, error: 'Name and email are required' };
    }

    if (isNaN(projectId) || isNaN(userId)) {
      return { success: false, error: 'Invalid project or user ID' };
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return { success: false, error: 'Project not found' };
    }

    const projectPrisma = getProjectPrismaClient(project.databaseUrl);

    // Check if email already exists for another user
    const existingUser = await projectPrisma.user.findFirst({
      where: { 
        email: email.trim(),
        NOT: { id: userId }
      }
    });

    if (existingUser) {
      return { success: false, error: 'Email already exists for another user' };
    }

    const updatedUser = await projectPrisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email.trim(),
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Failed to update user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

// Delete a user
export async function deleteUser(
  projectId: number,
  userId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (isNaN(projectId) || isNaN(userId)) {
      return { success: false, error: 'Invalid project or user ID' };
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return { success: false, error: 'Project not found' };
    }

    const projectPrisma = getProjectPrismaClient(project.databaseUrl);

    await projectPrisma.user.delete({
      where: { id: userId },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}