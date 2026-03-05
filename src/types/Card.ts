export type CardType = "ATTACK" | "DEFENSE" | "VERSATILE" | "SCHEME";

export interface Card {
  id: string;
  title: string;
  type: "ATTACK" | "DEFENSE" | "VERSATILE" | "SCHEME";
  value: number;
  boost: number;
  characterName: string;
  tags: string[];
  effectIds: string[];
}

export const BLANK_DEFENSE_CARD: Card = {
  id: "none",
  title: "No Card Played",
  type: "DEFENSE",
  value: 0,
  boost: 0,
  characterName: "",
  tags: [],
  effectIds: [],
};
