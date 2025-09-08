// src/app/actions/chat-actions.ts
import * as server from "next/server";
import { chatWithGemini } from "@/app/lib/ai";
import { getProjectClient } from "@/app/lib/getProjectClient";

export async function POST(req: server.NextRequest) {
  try {
    const { query, groupId, projectId } = await req.json();

    if (!query || !groupId || !projectId || query.trim() === "") {
      return server.NextResponse.json(
        { error: "Query, groupId, and projectId are required" },
        { status: 400 }
      );
    }

    const forbiddenTopics = ["backend", "marketing", "devops"];
    if (forbiddenTopics.some((topic) => query.toLowerCase().includes(topic))) {
      return server.NextResponse.json({
        reply: `I'm currently scoped to the "${groupId}" group. Try switching context to ask about other topics.`,
      });
    }

    const prisma = await getProjectClient(projectId);  
    const tasks = await prisma.task.findMany({
      where: { groupId },
      select: {
        title: true,
        description: true,
        status: true,
        priority: true,
      },
    });

    const context =
      tasks.length > 0
        ? tasks
            .map(
              (task, i) =>
                `#${i + 1}\nTask: ${task.title}\nStatus: ${
                  task.status
                }\nPriority: ${task.priority}\nDescription: ${
                  task.description ?? "None"
                }`
            )
            .join("\n\n")
        : "There are currently no tasks in this group.";

    const prompt = `You are a helpful assistant focused only on the "${groupId}" group. Here are the current tasks:\n\n${context}\n\nAnswer this question:\n${query}`;

    const reply = await chatWithGemini(prompt);

    return server.NextResponse.json({ reply });
  } catch (error) {
    console.error("🔥 [chat] Unexpected error:", error);
    return server.NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
