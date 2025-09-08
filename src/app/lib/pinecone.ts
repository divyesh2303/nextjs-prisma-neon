// app/lib/pinecone.ts
import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) {
  throw new Error("Missing PINECONE_API_KEY in environment");
}

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
