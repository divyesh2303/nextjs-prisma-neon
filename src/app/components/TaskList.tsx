// app/components/TaskBoard.tsx
"use client";

import { useState, useTransition } from "react";
import { createTask } from "@/app/actions/task-actions";
import type { Task } from "@/types";
const statusColumns = ["todo", "in-progress", "done", "error"];

export default function TaskBoard({
  projectId,
  initialTasks,
}: {
  projectId: number;
  initialTasks: Task[];
}) {
  const [tasks, setTasks] = useState(initialTasks);
  console.log("Initial tasks:", tasks);
  console.log("Initial tasks:", initialTasks);

  const [isPending, startTransition] = useTransition();

  const handleAddTask = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const title = formData.get("title") as string;
        const groupId = formData.get("groupId") as string; // make sure you have this in the form
        const description = formData.get("description") as string | undefined;

        const newTask = await createTask(projectId, {
          title,
          groupId,
          status: "TODO",
          priority: "LOW",
          description,
        });

        setTasks((prev) => [newTask, ...prev]);
      } catch (error) {
        console.error("Failed to add task:", error);
      }
    });
  };

  return (
    <div>
      <form action={handleAddTask} className="mb-4 flex gap-2">
        <input
          type="text"
          name="title"
          placeholder="New task"
          className="flex-1 border rounded p-2"
          disabled={isPending}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded"
          disabled={isPending}
        >
          Add Task
        </button>
      </form>

      <div className="grid grid-cols-4 gap-4">
        {statusColumns.map((status) => (
          <div key={status} className="p-3 border rounded bg-gray-50">
            <h4 className="font-semibold mb-2 capitalize">
              {status.replace("-", " ")}
            </h4>
            <ul className="space-y-2">
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <li
                    key={task.id}
                    className="p-3 border rounded bg-white flex flex-col"
                  >
                    {/* Title */}
                    <span className="font-medium">{task.title}</span>

                    {/* Description (optional) */}
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      {/* Status */}
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {task.status}
                      </span>

                      {/* Priority */}
                      <span className="text-xs bg-yellow-300 text-black px-2 py-1 rounded">
                        {task.priority}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
