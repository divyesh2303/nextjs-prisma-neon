// components/ChatBotWidget.tsx
"use client";

import { useState } from "react";
import { FiMessageCircle, FiSend } from "react-icons/fi";
import ReactMarkdown from "react-markdown"; // 👈 new

type Message = {
  sender: "user" | "bot";
  text: string;
  type?: "text" | "tasks" | "table";
  tasks?: {
    name: string;
    priority: string;
    description: string;
    status?: string;
  }[];
  table?: { headers: string[]; rows: string[][] };
};

export default function ChatBotWidget({
  activeGroup,
  projectId, // 👈 add projectId
}: {
  activeGroup: string;
  projectId: number; // 👈 type matches your backend
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const parseReply = (reply: string): Message => {
    // Detect markdown table
    if (reply.includes("|") && reply.includes("---")) {
      const lines = reply
        .trim()
        .split("\n")
        .filter((l) => l.includes("|"));
      const headers = lines[0]
        .split("|")
        .map((h) => h.trim())
        .filter(Boolean);
      const rows = lines.slice(2).map((line) =>
        line
          .split("|")
          .map((c) => c.trim())
          .filter(Boolean)
      );
      return {
        sender: "bot",
        text: reply,
        type: "table",
        table: { headers, rows },
      };
    }

    // Detect task list pattern
    if (reply.includes("The available tasks")) {
      return { sender: "bot", text: reply, type: "tasks" };
    }

    // Default → text (markdown supported)
    return { sender: "bot", text: reply, type: "text" };
  };

  const sendQuery = async () => {
    if (!query.trim()) return;
    const userMessage: Message = { sender: "user", text: query, type: "text" };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setQuery("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          groupId: activeGroup,
          projectId, // ✅ now sending
        }),
      });

      const data = await res.json();
      const botMessage = parseReply(data.reply || "No answer found.");
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Something went wrong.", type: "text" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50"
      >
        <FiMessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-4 w-96 h-[500px] bg-white shadow-lg rounded-2xl flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 font-semibold">
            Chat about {activeGroup}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.type === "table" && msg.table ? (
                  // ✅ Render table properly
                  <div className="bg-gray-100 rounded-2xl p-3 shadow max-w-[85%] text-sm overflow-x-auto">
                    <table className="min-w-full text-sm border-collapse">
                      <thead>
                        <tr>
                          {msg.table.headers.map((h, idx) => (
                            <th
                              key={idx}
                              className="border-b px-2 py-1 text-left font-semibold text-gray-700"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {msg.table.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="px-2 py-1 border-b text-gray-600"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // ✅ Render markdown for normal bot messages
                  <div
                    className={`px-3 py-2 rounded-2xl max-w-[75%] text-sm shadow prose prose-sm ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none prose-invert"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 text-sm animate-pulse">
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center border-t p-2 bg-white">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendQuery()}
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-2 text-sm outline-none"
            />
            <button
              onClick={sendQuery}
              disabled={loading || !query.trim()}
              className="ml-2 p-2 text-blue-600 disabled:text-gray-400"
            >
              <FiSend size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
