export type CardType = "ATTACK" | "DEFENSE" | "VERSATILE" | "SCHEME";

export interface Card {
  id: string;
  title: string;
  type: CardType;
  value: number;
  boost: number;
  tags: string[];
  characterName: string;
}
