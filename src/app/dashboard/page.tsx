// src/app/dashboard/page.tsx
import NewProjectForm from "../components/NewProjectForm";
import ProjectCard from "../components/ProjectCard";
import { getProjects } from "../actions/project-actions";

export default async function DashboardPage() {
  const projects = await getProjects();

  return (
    <main className="p-10">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage tenants (one DB per project)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className=" ">
          <h2 className="text-lg font-medium mb-4">Create new project</h2>
          <NewProjectForm />
        </div>

        <div className="   "> 
          <h2 className="text-lg font-medium mb-4">Your projects</h2>
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-sm text-gray-500">No projects yet.</p>
            ) : (
              projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
