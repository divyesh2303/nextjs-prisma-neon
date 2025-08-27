// app/dashboard/projects/[id]/components/UserList.tsx
"use client";

import React, { useState, useTransition, useOptimistic } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { createUser, updateUser, deleteUser } from "@/app/actions/user-actions";
import type { User } from "@/types";
import ClientDate from "./ClientDate";

interface UserListProps {
  projectId: number;
  initialUsers: User[];
}

type OptimisticAction =
  | { type: "add"; user: User }
  | { type: "update"; userId: number; user: Partial<User> }
  | { type: "delete"; userId: number };

export const UserList = ({ projectId, initialUsers }: UserListProps) => {
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticUsers, addOptimisticUser] = useOptimistic(
    initialUsers,
    (state: User[], action: OptimisticAction) => {
      switch (action.type) {
        case "add":
          return [action.user, ...state];
        case "update":
          return state.map((user) =>
            user.id === action.userId ? { ...user, ...action.user } : user
          );
        case "delete":
          return state.filter((user) => user.id !== action.userId);
        default:
          return state;
      }
    }
  );

  const handleAddUser = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (!name?.trim() || !email?.trim()) {
      setError("Name and email are required");
      return;
    }

    const optimisticUser: User = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    startTransition(() => {
      addOptimisticUser({ type: "add", user: optimisticUser });
    });

    const result = await createUser(projectId, formData);

    if (result.success) {
      setShowUserForm(false);
      setError(null);
    } else {
      setError(result.error || "Failed to create user");
    }
  };

  const handleUpdateUser = async (userId: number, formData: FormData) => {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (!name?.trim() || !email?.trim()) {
      setError("Name and email are required");
      return;
    }

    startTransition(() => {
      addOptimisticUser({
        type: "update",
        userId,
        user: { name: name.trim(), email: email.trim() },
      });
    });

    const result = await updateUser(projectId, userId, formData);

    if (result.success) {
      setEditingUser(null);
      setError(null);
    } else {
      setError(result.error || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    startTransition(() => {
      addOptimisticUser({ type: "delete", userId });
    });

    const result = await deleteUser(projectId, userId);
    if (!result.success) {
      setError(result.error || "Failed to delete user");
    }
  };

  const startEditingUser = (user: User) => {
    setEditingUser({ ...user });
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
        <h2 className="text-lg font-semibold text-gray-800">Users</h2>
        <button
          onClick={() => {
            setShowUserForm(!showUserForm);
            setError(null);
          }}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={isPending}
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Add user form */}
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
            <input
              type="email"
              name="email"
              placeholder="Email"
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
              {isPending ? "Adding..." : "Add User"}
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

      {/* User List */}
      <div className="space-y-3">
        {optimisticUsers.length ? (
          optimisticUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 bg-gray-50 rounded-lg border flex items-center justify-between"
            >
              {editingUser?.id === user.id ? (
                <form
                  action={(formData) => handleUpdateUser(user.id, formData)}
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
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingUser.email}
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
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClientDate
                      date={user.createdAt}
                      className="text-xs text-gray-400"
                    />
                    <button
                      onClick={() => startEditingUser(user)}
                      className="text-blue-500 hover:bg-blue-50 p-1 rounded"
                      disabled={isPending}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
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
            No users yet. Add your first user!
          </div>
        )}
      </div>
    </div>
  );
};
