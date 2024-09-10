import OpenAI from "openai";
import SubstackNote from "../../../models/subtackNote";

export const processNotes = async (notes: SubstackNote[]) => {
  const openai = new OpenAI();
  const best20Notes = notes
    .filter(note => note.text.length > 0)
    .sort((a, b) => b.likes + b.comments - a.likes - a.comments)
    .slice(0, 20);

  const notesText = best20Notes
    .map(
      note =>
        `Note: ${note.text}\nLikes: ${note.likes}\nComments: ${note.comments}\nRestacks: ${note.restacks}`,
    )
    .join("\n");
  if (!notesText) {
    return;
  }
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `According to the notes, please figure out which of the notes are the best performing, by likes and comments and then, give me 10 ideas for new notes based on the existing notes. Please return it in a format like this :
            {
            recommendations: [
            {
            idea: string,
                hook: string,
                content: string,
                }
        ]
            }. ONLY the json object so I can use JSON.parse() on it. \n\n ${notesText}`,
      },
    ],
  });
  return completion.choices[0].message.content;
};
