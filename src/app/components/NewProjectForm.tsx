// NewProjectForm.tsx
"use client";

import React, { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createProject } from "@/app/actions/project-actions";

const NewProjectForm: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFormAction = async (formData: FormData) => {
    setError(null);

    startTransition(async () => {
      try {
        await createProject(formData);
        setShowForm(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create project"
        );
      }
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setError(null);
  };

  if (showForm) {
    return (
      <div className="flex flex-col space-y-2">
        <form action={handleFormAction} className="flex items-center space-x-2">
          <input
            name="name"
            type="text"
            placeholder="Project Name"
            required
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            disabled={isPending}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {isPending ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </form>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center transition-colors"
    >
      <Plus className="w-5 h-5 mr-2" />
      New Project
    </button>
  );
};

export default NewProjectForm;
