// src/app/components/AddTaskModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createTask, updateTask } from "../actions/task-actions";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: Status;
  priority: Priority;
  groupId: string;
  position: number;
};
export type Status = "TODO" | "IN_PROGRESS" | "ERROR" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export default function AddTaskModal({
  projectId,
  groups,
  task,
  mode = "add",
  onTaskSaved,
}: {
  projectId: number | null;
  groups: { id: string; name: string }[];
  task?: Task;
  mode?: "add" | "edit";
  onTaskSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("TODO");
  const [priority, setPriority] = useState<Priority>("MEDIUM");

  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");

  // Prefill form when editing
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setPriority(task.priority);
      setGroupId(task.groupId);
      setOpen(true); // open modal immediately in edit mode
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    try {
      if (mode === "edit" && task) {
        await updateTask(projectId, task.id, {
          title,
          description,
          status: status,
          priority: priority,
        });
      } else {
        await createTask(projectId, {
          title,
          description,
          status: status,
          priority: priority,
          groupId,
        });
      }

      if (onTaskSaved) onTaskSaved();
      setOpen(false);

      // reset only if add mode
      if (mode === "add") {
        setTitle("");
        setDescription("");
        setStatus("TODO");
        setPriority("MEDIUM");
        setGroupId(groups[0]?.id ?? "");
      }
    } catch (err) {
      console.error("Failed to save task", err);
    }
  };

  return (
    <>
      {mode === "add" && (
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={() => setOpen(true)}
        >
          + Add Task
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-md w-96">
            <h2 className="font-semibold mb-3">
              {mode === "edit" ? "Edit Task" : "Add Task"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                className="w-full border p-2 rounded"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full border p-2 rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="flex gap-2">
                <select
                  className="border p-2 rounded flex-1"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ERROR">Error</option>
                  <option value="DONE">Done</option>
                </select>

                <select
                  className="border p-2 rounded flex-1"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              {mode === "add" && (
                <select
                  className="border p-2 rounded w-full"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-1 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  {mode === "edit" ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
