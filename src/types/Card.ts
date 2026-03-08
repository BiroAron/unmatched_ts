export type CardType = "ATTACK" | "DEFENSE" | "VERSATILE" | "SCHEME";
export type EffectPhase =
  | "immediately"
  | "beforeCombat"
  | "duringCombat"
  | "afterCombat"
  | "scheme";

export interface CardEffect {
  phase: EffectPhase;
  type:
    | "draw"
    | "move"
    | "damage"
    | "cancel"
    | "discard"
    | "recoverHp"
    | "custom"
    | "lookAtOpponentHand"
    | "valueSet";
  value?: number;
  target?: "self" | "opponent" | "attacker" | "defender" | "choose";
  condition?: "won" | "lost" | "damaged" | "startedDifferentZone";
  instruction?: string;
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
