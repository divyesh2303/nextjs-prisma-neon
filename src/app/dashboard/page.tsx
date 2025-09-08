// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import NewProjectForm from "../components/NewProjectForm";
import { UserList } from "../components/GroupList";
import { getProjects } from "../actions/project-actions";
import { getGroups } from "../actions/group-actions";
import type { Group, Project } from "@/types";
import ChatBotWidget from "../components/ChatBotWidget";
import TaskBoard from "../components/TaskBoard";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [groups, setGroups] = useState<Group[]>([]);

  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Load projects
  useEffect(() => {
    async function fetchProjects() {
      const data = await getProjects();
      setProjects(data);
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    async function fetchGroups() {
      if (!selectedProject) return;
      const data = await getGroups(selectedProject.id);

      const fullGroups: Group[] = data.map((g) => ({
        ...g,
        updatedAt: g.createdAt,
      }));
      setGroups(fullGroups);
    }
    fetchGroups();
  }, [selectedProject]);

  return (
    <div className="flex h-screen">
      {/* LEFT SIDEBAR */}
      <aside className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Create new project</h2>
          <NewProjectForm />
        </div>

        <h2 className="font-semibold mb-2">Select Workspace</h2>
        <select
          className="w-full border rounded p-2 mb-4"
          value={selectedProject?.id || ""}
          onChange={(e) => {
            const projId = Number(e.target.value);
            const proj = projects.find((p) => p.id === projId);
            setSelectedProject(proj || null);
            setActiveGroup(null);
          }}
        >
          <option value="">-- Select Project --</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        {selectedProject && (
          <>
            <h3 className="font-medium mb-2">
              Groups in {selectedProject.name}
            </h3>
            <UserList
              projectId={selectedProject.id ?? 0}
              initialUsers={groups}
              onSelectGroup={setActiveGroup}
            />
          </>
        )}
      </aside>

      {/* RIGHT MAIN PANEL */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <TaskBoard
          projectId={selectedProject?.id ?? null}
          activeGroup={activeGroup}
          groups={groups}
        />
      </main>
      {activeGroup && selectedProject && (
        <ChatBotWidget
          activeGroup={activeGroup}
          projectId={selectedProject.id}
        />
      )}
    </div>
  );
}
