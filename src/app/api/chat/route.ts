import * as server from "next/server";
import { chatWithGemini } from "@/app/lib/ai";
import { getProjectClient } from "@/app/lib/getProjectClient";

export async function POST(req: server.NextRequest) {
  try {
    console.log("🔵 [chat] Incoming POST request");

    const { query, groupId, projectId } = await req.json();
    console.log("🟡 [chat] Received query:", query);
    console.log("🟡 [chat] Received groupId:", groupId);
    console.log("🟡 [chat] Received projectId:", projectId);

    if (!query || !groupId || !projectId || query.trim() === "") {
      console.warn("⚠️ [chat] Missing query, projectId, or groupId");
      return server.NextResponse.json(
        { error: "Query, projectId, and groupId are required" },
        { status: 400 }
      );
    }

    // Block forbidden topics
    const forbiddenTopics = ["backend", "marketing", "devops"];
    if (forbiddenTopics.some((topic) => query.toLowerCase().includes(topic))) {
      console.log("🛑 [chat] Query rejected due to forbidden topic:", query);
      return server.NextResponse.json({
        reply: `I'm currently scoped to the "${groupId}" group. Try switching context to ask about other topics.`,
      });
    }

    // ✅ Connect to the correct project's DB
    console.log("📦 [chat] Fetching tasks for group:", groupId);
    const prisma = await getProjectClient(projectId);

    // ✅ Now safely query tasks inside that DB
    const tasks = await prisma.task.findMany({
      where: { groupId },
      select: {
        title: true,
        description: true,
        status: true,
        priority: true,
      },
    });
    console.log(`📦 [chat] Retrieved ${tasks.length} tasks`);

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
    console.log("✅ [chat] Gemini reply:\n", reply);

    return server.NextResponse.json({ reply });
  } catch (error) {
    console.error("🔥 [chat] Unexpected error:", error);
    return server.NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
