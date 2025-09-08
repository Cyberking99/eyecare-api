import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // A cost-effective and capable model
      messages: messages,
      temperature: 0.7,
      max_tokens: 250,
    });

    return completion.choices[0]?.message?.content || "I'm sorry, I could not generate a response.";
  } catch (error) {
    console.error("Error getting chat completion from OpenAI:", error);
    throw new Error("Failed to get response from AI assistant.");
  }
}