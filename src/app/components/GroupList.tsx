// src/app/components/GroupList.tsx
"use client";

import React, { useState, useTransition, useOptimistic } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import {
  createGroup,
  updateGroup,
  deleteGroup,
} from "@/app/actions/group-actions";
import type { Group } from "@/types";
import ClientDate from "./ClientDate";

interface UserListProps {
  projectId: number;
  initialUsers: Group[];
  onSelectGroup?: (groupId: string) => void;
}
type OptimisticAction =
  | { type: "add"; group: Group }
  | { type: "update"; groupId: string; group: Partial<Group> }
  | { type: "delete"; groupId: string };

export const UserList = ({
  projectId,
  initialUsers,
  onSelectGroup,
}: UserListProps) => {
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [optimisticUsers, addOptimisticUser] = useOptimistic(
    initialUsers,
    (state: Group[], action: OptimisticAction) => {
      switch (action.type) {
        case "add":
          return [action.group, ...state];
        case "update":
          return state.map((g) =>
            g.id === action.groupId ? { ...g, ...action.group } : g
          );
        case "delete":
          return state.filter((g) => g.id !== action.groupId);
        default:
          return state;
      }
    }
  );

  const handleAddUser = async (formData: FormData) => {
    const name = formData.get("name") as string;

    if (!name?.trim()) {
      setError("Name is required");
      return;
    }

    const optimisticGroup: Group = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    startTransition(() => {
      addOptimisticUser({ type: "add", group: optimisticGroup });
    });

    const result = await createGroup(projectId, formData);

    if (result.success) {
      setShowUserForm(false);
      setError(null);
    } else {
      setError(result.error || "Failed to create group");
    }
  };

  const handleUpdateUser = async (groupId: string, formData: FormData) => {
    const name = formData.get("name") as string;

    if (!name?.trim()) {
      setError("Name is required");
      return;
    }

    startTransition(() => {
      addOptimisticUser({
        type: "update",
        groupId,
        group: { name: name.trim() },
      });
    });

    const result = await updateGroup(projectId, groupId, formData);

    if (result.success) {
      setEditingUser(null);
      setError(null);
    } else {
      setError(result.error || "Failed to update group");
    }
  };

  const handleDeleteUser = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    startTransition(() => {
      addOptimisticUser({ type: "delete", groupId });
    });

    const result = await deleteGroup(projectId, String(groupId));
    if (!result.success) {
      setError(result.error || "Failed to delete group");
    }
  };

  const startEditingUser = (group: Group) => {
    setEditingUser({ ...group });
    setError(null);
  };

  const cancelEditingUser = () => {
    setEditingUser(null);
    setError(null);
  };

  return (
    <div>
      {/* Header + Add button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => {
            setShowUserForm(!showUserForm);
            setError(null);
          }}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={isPending}
        >
          <Plus className="w-4 h-4" /> Add Group
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Add group form */}
      {showUserForm && (
        <form
          action={handleAddUser}
          className="mb-6 p-4 border rounded-lg bg-gray-50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              required
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
            />
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Adding..." : "Add Group"}
            </button>
            <button
              type="button"
              onClick={() => setShowUserForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              disabled={isPending}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Group List */}
      <div className="space-y-3">
        {optimisticUsers.length ? (
          optimisticUsers.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectGroup?.(group.id)}
              className={`p-4 bg-gray-50 rounded-lg border flex items-center justify-between cursor-pointer hover:bg-blue-50 ${
                editingUser?.id === group.id ? "ring-2 ring-blue-400" : ""
              }`}
            >
              {editingUser?.id === group.id ? (
                <form
                  action={(formData) => handleUpdateUser(group.id, formData)}
                  className="flex flex-col w-full gap-2"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingUser.name}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isPending}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isPending ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditingUser}
                      className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600"
                      disabled={isPending}
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <div className="text-md font-medium text-gray-800">
                      {group.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClientDate
                      date={group.createdAt}
                      className="text-xs text-gray-400"
                    />
                    <button
                      onClick={() => startEditingUser(group)}
                      className="text-blue-500 hover:bg-blue-50 p-1 rounded"
                      disabled={isPending}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(group.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                      disabled={isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No groups yet. Add your first one!
          </div>
        )}
      </div>
    </div>
  );
};
