import type { Card } from "./Card.ts";

export type TurnPhase = "move" | "attack" | "scheme" | "end";

export interface SerializedPlayerState {
  characterId: string;
  characterName: string;
  hp: number;
  maxHp: number;
  baseMove: number;
  rangeType: "MELEE" | "RANGED";
  deck: Card[];
  hand: Card[];
  discard: Card[];
  currentSpaceId: string;
  turnStartSpaceId: string;
  spacesVisitedThisTurn: string[];
  pendingMovePoints: number;
}

export interface GameState {
  mapName: string;
  players: SerializedPlayerState[];
  activePlayerIndex: number;
  turnPhase: TurnPhase;
  turnCount: number;
  winner: string | null;
}

export interface LogEntry {
  type: "combat" | "move" | "effect" | "draw" | "damage" | "scheme" | "system";
  message: string;
}
