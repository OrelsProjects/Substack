import OpenAI from "openai";
import SubstackNote, {
  RecommendationNoHandler,
  SubstackNoteContentMatrixRecommendation,
} from "@/models/substackNote";
import { basicPrompt, contentMatrixPrompt } from "../_consts/propmpts";

type Models = "gpt-4o" | "content-matrix";

const runLLM = async (model: Models, prompt: string) => {
  const openai = new OpenAI();
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  return completion.choices[0].message.content;
};

const parseRecommendations = (
  text: string | null,
  model: Models,
): RecommendationNoHandler[] => {
  const cleanJsonData = text
    ?.replace(/\`\`\`json\n/, "")
    .replace(/\n\`\`\`/, "");

  // Parse the clean JSON data into an object
  const obj = JSON.parse(cleanJsonData || "[]");

  switch (model) {
    case "gpt-4o":
      return obj.recommendations as RecommendationNoHandler[];
    case "content-matrix":
      return obj.recommendations as SubstackNoteContentMatrixRecommendation[];
    default:
      return [];
  }
};

export const processNotes = async (
  notes: SubstackNote[],
  model: Models = "gpt-4o",
): Promise<RecommendationNoHandler[]> => {
  let prompt = "";
  switch (model) {
    case "gpt-4o":
      prompt = basicPrompt(notes);
      break;
    case "content-matrix":
      prompt = contentMatrixPrompt(notes);
      break;
    default:
      return [];
  }
  if (!prompt) {
    return [];
  }

  const response = await runLLM("gpt-4o", prompt);
  return parseRecommendations(response, model);
};
