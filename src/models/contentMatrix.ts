export type Topic =
  | "Assets"
  | "Automation"
  | "Autononomy"
  | "Brand"
  | "Building"
  | "Community"
  | "Confidence"
  | "Consequences"
  | "Consistency"
  | "Criticism"
  | "Digital products"
  | "Doubt"
  | "Ego"
  | "Entrepreneurship"
  | "Execution"
  | "Helping others"
  | "Leverage"
  | "Long game"
  | "Momentum"
  | "Money"
  | "Networking"
  | "Opportunity"
  | "Productivity"
  | "Promotion"
  | "Publishing"
  | "Responsibility"
  | "Risk"
  | "Sales"
  | "Self-promotion"
  | "Sharing"
  | "Social Media"
  | "Solopreneurship"
  | "Success"
  | "Systems"
  | "Thinking"
  | "Time"
  | "Work Ethic"
  | "Writing";

export const topics: Topic[] = [
  "Assets",
  "Automation",
  "Autononomy",
  "Brand",
  "Building",
  "Community",
  "Confidence",
  "Consequences",
  "Consistency",
  "Criticism",
  "Digital products",
  "Doubt",
  "Ego",
  "Entrepreneurship",
  "Execution",
  "Helping others",
  "Leverage",
  "Long game",
  "Momentum",
  "Money",
  "Networking",
  "Opportunity",
  "Productivity",
  "Promotion",
  "Publishing",
  "Responsibility",
  "Risk",
  "Sales",
  "Self-promotion",
  "Sharing",
  "Social Media",
  "Solopreneurship",
  "Success",
  "Systems",
  "Thinking",
  "Time",
  "Work Ethic",
  "Writing",
];

export interface Structure {
  name: string;
  description: string;
}

export const structures: Structure[] = [
  {
    name: "Actionable",
    description: "How can people do something, step-by-step?",
  },
  {
    name: "Motivational",
    description: "Inspire people to take action through a story or anecdote.",
  },
  {
    name: "Analytical",
    description: "Do a tear down of a company, person, content style, etc.",
  },
  {
    name: "Contrarian",
    description: "Something you feel differently about vs. the status quo.",
  },
  {
    name: "Observation",
    description: "What's something you've observed that you can talk about?",
  },
  {
    name: "X vs. Y",
    description: "Compare two situations for an interesting takeaway",
  },
  {
    name: "Present / Future",
    description: "How things work today vs. how you think in the future?",
  },
  {
    name: "Listicle",
    description:
      "A list of things (top books, people, podcasts, etc.) PLEASE USE SPARINGLY.",
  },
  {
    name: "Personal Story",
    description: "Write a story about something that happened this week",
  },
  {
    name: "Lessons Learned",
    description:
      "Share a mistake you made, what you learned from it, and how others can avoid the same pitfall.",
  },
  {
    name: "Common Mistakes",
    description:
      "List common errors you see people making in your industry and offer advice on avoiding them.",
  },
  {
    name: "Upcoming Week",
    description: "What are you working on this week?",
  },
  {
    name: "Highs/Lows",
    description:
      "What went well and what went poorly. Usually good for a friday.",
  },
];
