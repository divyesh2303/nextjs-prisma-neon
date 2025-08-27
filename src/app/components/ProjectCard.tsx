// components/ProjectCard.tsx
"use client";

import React, { useState, useTransition } from "react";
import { Eye, Edit2, Trash2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateProject, deleteProject } from "@/app/actions/project-actions";
import type { Project } from "@/types";
import ClientDate from "./ClientDate";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleView = () => router.push(`/dashboard/projects/${project.id}`);
  const handleEdit = () => {
    setIsEditing(true);
    setEditName(project.name);
  };

  const handleSave = () => {
    if (!editName.trim()) {
      setError("Project name is required");
      return;
    }
    startTransition(async () => {
      try {
        await updateProject(project.id, { name: editName.trim() });
        setIsEditing(false);
      } catch {
        setError("Failed to update project");
      }
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(project.name);
    setError(null);
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteProject(project.id);
      } catch {
        setError("Failed to delete project");
      }
    });
  };

  return (
    <div className="bord  er rounded-lg p-4 shadow-sm bg-white max-w-sm relative">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-full"
              disabled={isPending}
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={isPending}
              className="text-green-600 hover:text-green-800"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          project.name
        )}
      </h3>
      <p className="text-xs text-gray-500 mb-2">ID: {project.id}</p>

      <div className="flex gap-3 mt-2">
        {!isEditing && (
          <>
            <button
              onClick={handleView}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
            >
              Open
            </button>
            <button
              onClick={handleEdit}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-red-500 hover:bg-gray-100 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-600 border border-red-200 p-2 rounded bg-red-50">
          {error}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 border-t pt-2">
        Created: <ClientDate date={project.createdAt} />
      </div>

      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-lg">
          <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
