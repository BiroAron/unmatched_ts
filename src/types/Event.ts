import type { PlayerState } from "../engine/PlayerState.ts";
import type { Card } from "./Card.ts";

export interface MoveContext {
  type: "move";
  player: PlayerState;
  baseMove: number;
  bonusMove: number;
}

export interface CombatContext {
  type: "combat";
  attacker: PlayerState;
  defender: PlayerState;
  attackCard: Card;
  defenseCard: Card;

  attackModifier: number;
  defenseModifier: number;

  finalAttackValue: number;
  finalDefenseValue: number;

  damageDealt: number;
}

export interface EventMap {
  beforeMovement: MoveContext;
  afterMovement: { player: PlayerState; spacesMoved: number }; // Added: helpful for "after move" triggers
  immediately: CombatContext;
  duringCombat: CombatContext;
  afterCombat: CombatContext;
  customEffect: {
    instruction: string;
    actor: PlayerState;
    context: CombatContext | MoveContext;
  };
}
