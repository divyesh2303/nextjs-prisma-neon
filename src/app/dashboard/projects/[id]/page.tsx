// app/dashboard/projects/[id]/page.tsx
import React from "react";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getUsers } from "@/app/actions/user-actions";
import { UserList } from "@/app/components/UserList";

interface PageProps {
  params: Promise<{ id: string }>;
}

const ProjectDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const projectId = Number(id);

  if (isNaN(projectId)) {
    redirect("/dashboard");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    notFound();
  }

  const users = await getUsers(projectId);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="flex items-center text-blue-600 hover:underline text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Projects
      </Link>

      {/* Project header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {project.name}
            </h1>
            <p className="text-sm text-gray-500">ID: {project.id}</p>
            <p className="text-xs text-gray-400 mt-1">
              Created: {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* User list section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Project Users
        </h2>
        <UserList projectId={projectId} initialUsers={users} />
      </div>
    </div>
  );
};

export default ProjectDetailPage;
