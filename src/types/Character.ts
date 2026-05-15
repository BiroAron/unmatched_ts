import type { Card } from "./Card.ts";
import type { EventBus } from "../engine/EventBus.ts";
import type { PlayerState } from "../engine/PlayerState.ts";

export interface CharacterData {
  id: string;
  name: string;
  maxHp: number;
  rangeType: "MELEE" | "RANGED";
  deck: Card[];
  registerHooks: (bus: EventBus, player: PlayerState) => void;
}

export function createCards(
  template: Omit<Card, "id">,
  quantity: number,
  prefix: string,
): Card[] {
  return Array.from({ length: quantity }).map((_, i) => ({
    ...template,
    id: `${prefix}-${i + 1}`,
  }));
}
