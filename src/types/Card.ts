export type CardType = "ATTACK" | "DEFENSE" | "VERSATILE" | "SCHEME";

export interface CardEffect {
  phase:
    | "immediately"
    | "beforeCombat"
    | "duringCombat"
    | "afterCombat"
    | "scheme";
  type:
    | "draw"
    | "move"
    | "damage"
    | "cancel"
    | "discard"
    | "recoverHp"
    | "custom";
  value?: number;
  target?: "self" | "opponent" | "attacker" | "defender";
  condition?: "won" | "lost" | "damaged" | "startedDifferentZone";
  instruction?: string; // For "custom" logic that is too unique to automate
}

export interface Card {
  id: string;
  title: string;
  type: "ATTACK" | "DEFENSE" | "VERSATILE" | "SCHEME";
  value: number;
  boost: number;
  characterName: string;
  tags: string[];
  effects: CardEffect[];
}

export const BLANK_DEFENSE_CARD: Card = {
  id: "none",
  title: "No Card Played",
  type: "DEFENSE",
  value: 0,
  boost: 0,
  characterName: "",
  tags: [],
  effects: [],
};
