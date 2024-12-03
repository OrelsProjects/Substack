import { Structure, Topic } from "./contentMatrix";

export default interface SubstackNote {
  id: string;
  publishDate: Date | null;
  isRestack: boolean;
  image: string | null;
  hasOpenGraphImage: boolean;
  text: string;
  likes: number;
  comments: number;
  restacks: number;
}

export interface SubstackNoteRecommendation {
  idea: string;
  hook: string;
  content: string;
  rating: number;
  handler: string;
  inspiredBy: string | null;
}

export interface SubstackNoteContentMatrixRecommendation
  extends SubstackNoteRecommendation {
  structure: Structure;
  topic: Topic;
}

export type SubstackNoteRecommendationWithNote = (
  | SubstackNoteRecommendation
  | SubstackNoteContentMatrixRecommendation
) & {
  userNote: SubstackNote | null;
};

export type RecommendationNoHandler = Omit<
  SubstackNoteRecommendation,
  "handler"
>;

export type RecommendationNoHandlerContentMatrix = Omit<
  SubstackNoteContentMatrixRecommendation,
  "handler"
>;
