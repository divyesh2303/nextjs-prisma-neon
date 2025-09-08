// src/app/components/TaskBoard.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import AddTaskModal from "./AddTaskModal";
import {
  deleteTask,
  getTasks,
  updateTaskStatus,
} from "../actions/task-actions";
import type { Status, Priority } from "@/types";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: Status;
  priority: Priority;
  groupId: string;
  position: number;
};

const columns = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  ERROR: "Error",
  DONE: "Done",
};

export default function TaskBoard({
  projectId,
  activeGroup,
  groups,
}: {
  projectId: number | null;
  activeGroup: string | null;
  groups: { id: string; name: string }[];
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    if (!activeGroup || !projectId) return;
    const data = await getTasks(projectId, activeGroup);
    setTasks(data);
  }, [activeGroup, projectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    setTasks((prev) => {
      const updated = [...prev];
      const movedTask = updated.find((t) => t.id === draggableId);
      if (movedTask) {
        movedTask.status = destination.droppableId as Status;
        movedTask.position = destination.index;
      }
      return [...updated];
    });

    try {
      await updateTaskStatus(
        projectId!,
        draggableId,
        destination.droppableId as Task["status"]
      );
    } catch (err) {
      console.error("Failed to persist task update", err);
    }
  };

  return (
    <main className="flex-1 p-6 bg-gray-100">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Task Progression</h1>
        {activeGroup && (
          <AddTaskModal
            projectId={projectId}
            groups={groups}
            onTaskSaved={loadTasks}
          />
        )}
      </div>

      {activeGroup ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(columns).map(([status, label]) => (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-white p-3 rounded shadow min-h-[500px] ${
                      snapshot.isDraggingOver ? "bg-blue-50" : ""
                    }`}
                  >
                    <h2 className="font-semibold mb-2">{label}</h2>
                    {tasks
                      .filter((task) => task.groupId === activeGroup)
                      .filter((task) => task.status === status)
                      .sort((a, b) => a.position - b.position)
                      .map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-3 mb-2 bg-gray-200 rounded shadow cursor-pointer"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">
                                  {task.title}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    className="text-blue-600 text-xs underline"
                                    onClick={() => setEditingTask(task)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="text-red-600 text-xs underline"
                                    onClick={async () => {
                                      if (confirm("Delete this task?")) {
                                        await deleteTask(projectId!, task.id);
                                        loadTasks();
                                      }
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              {task.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex justify-between items-center mt-2 text-xs">
                                <span className="px-2 py-1 rounded font-semibold bg-yellow-200 text-yellow-800">
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                    {tasks.filter(
                      (task) =>
                        task.groupId === activeGroup && task.status === status
                    ).length === 0 && (
                      <p className="text-sm text-gray-400">No tasks yet</p>
                    )}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <p className="text-gray-500">Select a group to view tasks</p>
      )}

      {/* Edit modal */}
      {editingTask && (
        <AddTaskModal
          projectId={projectId}
          groups={groups}
          task={editingTask}
          mode="edit"
          onTaskSaved={() => {
            loadTasks();
            setEditingTask(null);
          }}
        />
      )}
    </main>
  );
}
