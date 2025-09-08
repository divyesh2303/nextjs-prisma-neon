// lib/ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Create text embedding
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    console.log("🔢 Embedding length:", result.embedding.values.length);
    console.log("result is", result);
    return result.embedding.values;
  } catch (error: unknown) {
    console.error("❌ Failed to create embedding:", error);
    throw new Error("Embedding generation failed");
  }
}

// Optional: Use Gemini for chat too
export async function chatWithGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        (error as { status?: number }).status === 503
      ) {
        console.warn(`⚠️ Gemini overloaded (attempt ${attempt}), retrying...`);
        await new Promise((r) => setTimeout(r, 1000 * attempt)); // backoff
        continue;
      }

      console.error("❌ Gemini chat error:", error);
      throw new Error("Chat request failed");
    }
  }

  throw new Error("Gemini is currently overloaded. Please try again later.");
}

// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// // Create text embedding
// export async function getEmbedding(text: string): Promise<number[]> {
//   try {
//     const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
//     const result = await model.embedContent(text);
//     console.log("🔢 Embedding length:", result.embedding.values.length);
//     console.log("result is", result);
//     return result.embedding.values;
//   } catch (error) {
//     console.error("❌ Failed to create embedding:", error);
//     throw new Error("Embedding generation failed");
//   }
// }

// // Optional: Use Gemini for chat too
// export async function chatWithGemini(prompt: string): Promise<string> {
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//   for (let attempt = 1; attempt <= 3; attempt++) {
//     try {
//       const result = await model.generateContent(prompt);
//       return result.response.text();
//     } catch (error: any) {
//       if (error.status === 503) {
//         console.warn(`⚠️ Gemini overloaded (attempt ${attempt}), retrying...`);
//         await new Promise((r) => setTimeout(r, 1000 * attempt)); // backoff
//         continue;
//       }
//       console.error("❌ Gemini chat error:", error);
//       throw new Error("Chat request failed");
//     }
//   }

//   throw new Error("Gemini is currently overloaded. Please try again later.");
// }
