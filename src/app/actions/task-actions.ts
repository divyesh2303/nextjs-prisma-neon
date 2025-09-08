// src/app/actions/task-actions.ts
"use server";

import { getProjectClient } from "@/app/lib/getProjectClient";
import type { Status, Priority } from "@/lib/prisma-project";
import { pinecone } from "@/app/lib/pinecone";
import { getEmbedding } from "@/app/lib/ai";
import { prismaMaster } from "@/app/lib/prisma";

// Get Pinecone index dynamically per project
async function getTaskIndex(projectId: number) {
  const project = await prismaMaster.project.findUnique({
    where: { id: projectId },
    select: { pineconeIndex: true },
  });
  if (!project?.pineconeIndex) {
    throw new Error("Pinecone index not found for project");
  }
  return pinecone.index(project.pineconeIndex);
}

export async function getTasks(projectId: number, groupId: string) {
  const prisma = await getProjectClient(projectId);
  return prisma.task.findMany({
    where: { groupId },
    orderBy: { position: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      createdAt: true,
      groupId: true,
      position: true,
    },
  });
}

export async function createTask(
  projectId: number,
  data: {
    title: string;
    description?: string | null;
    status: Status;
    priority: Priority;
    groupId: string;
  }
) {
  const prisma = await getProjectClient(projectId);

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      priority: data.priority,
      groupId: data.groupId, // make sure this is passed
    },
  });

  try {
    const index = await getTaskIndex(projectId);

    const embedding = await getEmbedding(
      `${task.title} ${task.description ?? ""}`
    );

    await index.namespace(task.groupId).upsert([
      {
        id: String(task.id),
        values: embedding,
        metadata: {
          title: task.title,
          description: task.description ?? "",
          status: task.status,
          priority: task.priority,
        },
      },
    ]);
  } catch (err) {
    console.error("Failed to sync Pinecone:", err);
  }

  return task;
}

export async function updateTask(
  projectId: number,
  taskId: string,
  data: {
    title?: string;
    description?: string | null;
    status?: Status;
    priority?: Priority;
  }
) {
  const prisma = await getProjectClient(projectId);

  // 1. Update in DB
  const task = await prisma.task.update({
    where: { id: taskId },
    data,
  });

  try {
    const index = await getTaskIndex(projectId);

    // Always re-embed
    const embedding = await getEmbedding(
      `${task.title} ${task.description ?? ""}`
    );

    await index.namespace(task.groupId).upsert([
      {
        id: String(task.id),
        values: embedding,
        metadata: {
          title: task.title,
          description: task.description ?? "",
          status: task.status,
          priority: task.priority,
        },
      },
    ]);
  } catch (err) {
    console.error("Failed to update Pinecone:", err);
  }

  return task;
}

// Convenience function for frontend drag/drop
export async function updateTaskStatus(
  projectId: number,
  taskId: string,
  status: Status
) {
  return updateTask(projectId, taskId, { status });
}

export async function deleteTask(projectId: number, taskId: string) {
  const prisma = await getProjectClient(projectId);

  // Delete from DB
  const task = await prisma.task.delete({
    where: { id: taskId },
  });

  try {
    // Delete from Pinecone
    const index = await getTaskIndex(projectId);

    // Correct way with your SDK
    await index.namespace(task.groupId).deleteMany([String(task.id)]);
  } catch (err) {
    console.error("Failed to delete from Pinecone:", err);
  }

  return task;
}
