import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";

export interface SummaryResult {
  summary: string;
  coolFacts: string[];
}

/**
 * Summarizes a GitHub repository README using OpenAI
 * @param readmeContent - The raw README content to summarize
 * @returns Object with summary and coolFacts array
 */
export async function summarizeGithubReadme(
  readmeContent: string
): Promise<SummaryResult> {
  console.log("  → Initializing LangChain components...");

  // 1. Create the prompt
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an expert technical writer.
      
Summarize this GitHub repository based on the README content provided.
Provide a concise summary of what this repository is about, followed by a list of at least 3 "cool facts" or interesting points about the repo (if possible).

Your reply must be a JSON object with the following structure:
    {{
      "summary": string,
      "coolFacts": string[]
    }}`,
    ],
    [
      "human",
      `Here is the README content to analyze:

{context}

Remember: Output strictly a JSON object with a summary field and a coolFacts array.`,
    ],
  ]);
  console.log("  → Prompt template created");

  console.log("  → Creating OpenAI LLM instance (gpt-4o-mini)...");
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    modelKwargs: {
      response_format: { type: "json_object" }
    }
  });

  // 2. Create the chain using pipe syntax
  console.log("  → Building chain with pipe syntax...");
  const chain = prompt.pipe(llm).pipe(new StringOutputParser());

  // 3. Run the chain
  console.log("  → Invoking LLM with", readmeContent.length, "characters of context...");
  const rawOutput = await chain.invoke({ context: readmeContent });
  console.log("  → LLM response received");

  // 4. Parse the output as JSON
  console.log("  → Parsing JSON response...");
  console.log("  → Raw output preview:", rawOutput.substring(0, 200));
  
  // Clean the output - remove markdown code blocks and whitespace
  let cleanedOutput = rawOutput.trim();
  
  // Remove markdown code blocks (```json ... ``` or ``` ... ```)
  cleanedOutput = cleanedOutput.replace(/^```(?:json)?\s*/i, '');
  cleanedOutput = cleanedOutput.replace(/\s*```\s*$/i, '');
  cleanedOutput = cleanedOutput.trim();
  
  console.log("  → Cleaned output preview:", cleanedOutput.substring(0, 200));
  
  let result: SummaryResult;
  try {
    result = JSON.parse(cleanedOutput);
    console.log("  → JSON parsed successfully");
  } catch (e) {
    console.log("  ⚠ JSON parse failed, using fallback");
    console.error("  → Parse error:", e);
    // fallback: return whole output as summary and empty coolFacts
    result = {
      summary: cleanedOutput,
      coolFacts: [],
    };
  }

  // 5. Ensure shape
  if (!Array.isArray(result.coolFacts)) {
    console.log("  ⚠ Fixing coolFacts array");
    result.coolFacts = [];
  }
  if (typeof result.summary !== "string") {
    console.log("  ⚠ Fixing summary string");
    result.summary = "";
  }

  console.log("  → Returning result with", result.coolFacts.length, "cool facts");
  return result;
}

