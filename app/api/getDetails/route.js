import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index("codebase-rag", process.env.PINECONE_INDEX_HOST);

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function getEmbeddings(text) {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid text input: Text must be non-empty string.");
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch embeddings from Hugging Face.");
    }

    const data = await response.json();

    console.log("Hugging Face embeddings:", JSON.stringify(data).slice(0, 100));

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid response from Hugging Face.");
    }

    return data;
  } catch (error) {
    console.error("Error fetching embeddings:", error);
    throw error;
  }
}

async function performRag(query, namespace) {
  try {
    console.log("Getting embeddings for query: ", query);
    const embeddings = await getEmbeddings(query);

    console.log("Fetching embeddings from Pinecone...");

    const result = await index.namespace(namespace).query({
      vector: embeddings,
      topK: 10,
      includeMetadata: true,
    });

    console.log("Query response: ", {
      matches: result.matches?.length,
      firstMatch: result.matches?.[0],
    });

    if (!result.matches?.length) {
      throw new Error("No matches found in codebase.");
    }

    const context = result.matches.map((match) => match.metadata.content);

    const systemPrompt =
      "You are a Senior Software Engineer with expertise in TypeScript, Python, Java, C++, Go, Rust, C, and Swift. Your role is to answer questions about the codebase using the context provided. Always analyze all the available context thoroughly, and if the context is insufficient, use your expertise and previously provided information to form a thoughtful, accurate response. If any assumptions are required due to limited context, do not mention that you are limited by a lack of context or anything along those lines. Do not mention anything about a section for context on anything along those lines.";

    const augmentedQuery = `<CONTEXT>\n${context.join(
      "\n\n-------\n\n"
    )}\n-------\n</CONTEXT>\n\n\n\nMY QUESTION:\n${query}`;

    const completion = await openai.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: augmentedQuery },
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error performing RAG:", error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const { query, namespace } = await request.json();
    const response = await performRag(query, namespace);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
