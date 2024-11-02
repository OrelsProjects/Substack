import SubstackNote from "@/models/substackNote";
import { topics, structures } from "@/models/contentMatrix";

const notesToText = (notes: SubstackNote[]) => {
  const best20Notes = notes
    .filter(note => note.text.length > 0)
    .sort((a, b) => b.likes + b.comments - a.likes - a.comments)
    .slice(0, 20);

  const notesText = best20Notes
    .map(
      note =>
        `Note: ${note.text}\nLikes: ${note.likes}\nComments: ${note.comments}\nRestacks: ${note.restacks}\nid: ${note.id}`,
    )
    .join("\n");
  if (!notesText) {
    return [];
  }

  return notesText;
};

export const basicPrompt = (notes: SubstackNote[]) => {
  const notesText = notesToText(notes);
  return `According to the notes, please figure out which of the notes are the best performing, by likes and comments and then, give me 10 ideas for new notes based on the existing notes.
        Rate these ideas by how likely they are to perform well with a number between 0-1, float.
        Make sure the ideas are relevant to the notes and the audience and are not too similar to the existing notes.
        
        For every recommendation, write why you decided that this is the best idea,
        by adding "inspiredBy" you'll see down below, which is is the id of the note that inspired this idea.

        Make the ideas and the text as close to the notes style as possible. Don't use the same text, but make sure to write in the same style as the inspiration note.
        Also make sure the ideas are not too similar to the existing notes.

        Don't use the words embrace, foster.

        Please return it in a format like this :
            {
            recommendations: [
            {
              idea: string,
              hook: string,
              content: string,
              rating: number,
              inspiredBy: string, // id of the note that inspired this idea
            },
        ]
            }. ONLY the json object so I can use JSON.parse() on it. \n\n ${notesText}`;
};

export const contentMatrixPrompt = (notes: SubstackNote[]) => {
  const notesText = notesToText(notes);

  return `According to the notes, please figure out which of the notes are the best performing by likes and comments. Then, using the content matrix, give me 10 ideas for new notes based on the existing notes.
  
  Use the content matrix to select different types ${topics} and structures ${structures} for the ideas.
  
  For each recommendation, include the following fields:
  
  - idea: The main idea or topic of the note.
  - hook: A compelling opening or headline to grab attention.
  - content: A brief summary or outline of what the note would cover.
  - rating: Rate the idea by how likely it is to perform well with a number between 0-1 (float).
  - handler: The content type or category from the content matrix (e.g., Actionable, Motivational).
  - inspiredBy: The id of the note that inspired this idea, or null if it's not inspired by a specific note.
  - structure: The structure or format of the content (e.g., Listicle, Personal Story).
  - type: The type of content as per the content matrix.
  
  Make sure the ideas are relevant to the notes and the audience and are not too similar to the existing notes.
  
  Make the ideas and the text as close to the notes' style as possible. Don't use the same text, but ensure you write in the same style as the inspiration note.
  
  Also, ensure the ideas are not too similar to the existing notes.
  
  Don't use the words "embrace" or "foster."
  
  Please return it in a format like this:
  {
    "recommendations": [
      {
        "idea": "string",
        "hook": "string",
        "content": "string",
        "rating": number,
        "handler": "string",
        "inspiredBy": "string or null",
        "structure": "string",
        "type": "string"
      },
      ...
    ]
  }
  ONLY the JSON object so I can use JSON.parse() on it.
  
  ${notesText}`;
};
