// app/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-semibold text-gray-800">
          Welcome to Multi-Tenant SaaS
        </h1>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Manage your projects dynamically with isolated Neon databases and a
          scalable architecture.
        </p>
        <button
          onClick={goToDashboard}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Go to Dashboard
        </button>
      </div>
    </main>
  );
}
