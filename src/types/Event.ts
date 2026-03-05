import type { PlayerState } from "../engine/PlayerState.ts";
import type { Card } from "./Card.ts";

export interface MoveContext {
  player: PlayerState;
  bonusMove: number;
}

export interface CombatContext {
  attacker: PlayerState;
  defender: PlayerState;
  attackCard: Card;
  defenseCard?: Card;
  attackModifier: number;
  defenseModifier: number;
  damageDealt: number;
}

// A Map of Event Names to their specific Context types
export interface EventMap {
  beforeMovement: MoveContext;
  afterMovement: { player: PlayerState };
  beforeCombat: CombatContext;
  afterCombat: CombatContext;
}
