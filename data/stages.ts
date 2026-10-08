// The story stages inside the window, in order. The header shows the current stage's word (rolling from one to the
// next), and each top-level part of the window content belongs to one stage: the part id is the id of the section it
// holds (the menu targets in data/navigation.ts).
export type StageId = "absorb" | "build" | "grow" | "bloom";

export type Stage = { id: StageId; word: string; accent: string; part: string };

export const stages: Stage[] = [
  { id: "absorb", word: "ABSORB.", accent: "#e96b5a", part: "about" },
  { id: "build", word: "BUILD.", accent: "#7f9657", part: "project" },
  { id: "grow", word: "GROW.", accent: "#e9a33a", part: "design" },
  { id: "bloom", word: "BLOOM.", accent: "#e9a33a", part: "contact" },
];

export const stageOfPart = (part: string) => stages.find(stage => stage.part === part) ?? stages[0];
