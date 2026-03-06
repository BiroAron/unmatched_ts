import type { Card } from "../../types/Card.ts";
import type { EventBus } from "../../engine/EventBus.ts";
import type { PlayerState } from "../../engine/PlayerState.ts";

export interface CharacterData {
  name: string;
  maxHp: number;
  deck: Card[];
  registerHooks: (bus: EventBus, player: PlayerState) => void;
}

function createCards(
  template: Omit<Card, "id">,
  quantity: number,
  prefix: string,
): Card[] {
  return Array.from({ length: quantity }).map((_, i) => ({
    ...template,
    id: `${prefix}-${i + 1}`,
  }));
}

export const SINBAD_DATA: CharacterData = {
  name: "Sinbad",
  maxHp: 15,
  registerHooks: (bus, player) => {
    bus.subscribe("beforeMovement", (ctx) => {
      if (ctx.player === player) {
        const voyageCount = player.getDiscardCountByTag("voyage");
        ctx.bonusMove += voyageCount;
        console.log(
          `[Sinbad Passive] Adding +${voyageCount} movement from Voyages.`,
        );
      }
      return ctx;
    });

    bus.subscribe("duringCombat", (ctx) => {
      if (ctx.attacker === player && ctx.attackCard.tags.includes("voyage")) {
        const voyageCount = player.getDiscardCountByTag("voyage");
        ctx.finalAttackValue += voyageCount;
        console.log(
          `[Voyage Effect] ${ctx.attackCard.title} value increased by ${voyageCount}.`,
        );
      }
      return ctx;
    });
  },
  deck: [
    ...createCards(
      {
        title: "Commanding Impact",
        type: "ATTACK",
        value: 5,
        boost: 2,
        characterName: "Any",
        tags: [],
        effects: ["DRAW_ONE_CARD"],
      },
      1,
      "any-imp",
    ),
    ...createCards(
      {
        title: "By Fortune and Fate",
        type: "ATTACK",
        value: 3,
        boost: 1,
        characterName: "Porter",
        tags: [],
        effects: ["DRAW_TWO_CARDS"],
      },
      3,
      "por-fate",
    ),
    ...createCards(
      {
        title: "Voyage to the Cannibals With the Root of Madness",
        type: "ATTACK",
        value: 2,
        boost: 0,
        characterName: "Sinbad",
        tags: ["voyage"],
        effects: ["MOVE_TWO_SPACES"],
      },
      1,
      "sin-v1",
    ),
    ...createCards(
      {
        title: "Voyage to the Creature With Eyes Like Coals of Fire",
        type: "ATTACK",
        value: 2,
        boost: 0,
        characterName: "Sinbad",
        tags: ["voyage"],
        effects: ["OPPONENT_DISCARD_ONE"],
      },
      1,
      "sin-v2",
    ),
    ...createCards(
      {
        title: "Voyage to the City of the King of Serendib",
        type: "ATTACK",
        value: 2,
        boost: 0,
        characterName: "Sinbad",
        tags: ["voyage"],
        effects: ["DRAW_ONE_CARD"],
      },
      1,
      "sin-v3",
    ),
    ...createCards(
      {
        title: "Voyage to the Valley of the Giant Snakes",
        type: "ATTACK",
        value: 2,
        boost: 0,
        characterName: "Sinbad",
        tags: ["voyage"],
        effects: ["LOOK_AT_OPPONENT_HAND"],
      },
      1,
      "sin-v4",
    ),
    ...createCards(
      {
        title: "Voyage Home",
        type: "ATTACK",
        value: 2,
        boost: 0,
        characterName: "Sinbad",
        tags: ["voyage"],
        effects: ["RETURN_ALL_VOYAGES_TO_HAND"],
      },
      1,
      "sin-v5",
    ),
    ...createCards(
      {
        title: "Voyage to the City of the Man-Eating Apes",
        type: "ATTACK",
        value: 2,
        boost: 0,
        characterName: "Sinbad",
        tags: ["voyage"],
        effects: ["DEAL_TWO_DAMAGE"],
      },
      1,
      "sin-v6",
    ),
    ...createCards(
      {
        title: "Voyage to the Island That Was a Whale",
        type: "ATTACK",
        value: 2,
        boost: 0,
        characterName: "Sinbad",
        tags: ["voyage"],
        effects: ["RECOVER_TWO_HP"],
      },
      1,
      "sin-v7",
    ),
    ...createCards(
      {
        title: "Exploit",
        type: "VERSATILE",
        value: 3,
        boost: 1,
        characterName: "Any",
        tags: [],
        effects: ["DRAW_ONE_CARD"],
      },
      2,
      "any-exp",
    ),
    ...createCards(
      {
        title: "Leap Away",
        type: "VERSATILE",
        value: 4,
        boost: 1,
        characterName: "Any",
        tags: [],
        effects: ["IF_COMBAT_WON_MOVE_ONE_PARTICIPANT_FOUR_SPACES"],
      },
      2,
      "any-leap",
    ),
    ...createCards(
      {
        title: "Momentous Shift",
        type: "VERSATILE",
        value: 3,
        boost: 1,
        characterName: "Any",
        tags: [],
        effects: ["IF_STARTED_IN_DIFFERENT_ZONE_BASE_ATTACK_OF_CARD_SET_TO_5"],
      },
      3,
      "any-mom",
    ),
    ...createCards(
      {
        title: "Toil and Danger",
        type: "VERSATILE",
        value: 3,
        boost: 1,
        characterName: "Sinbad",
        tags: [],
        effects: ["MOVE_SINBAD_UP_TO_THREE_SPACES"],
      },
      4,
      "sin-toil",
    ),
    ...createCards(
      {
        title: "Feint",
        type: "VERSATILE",
        value: 2,
        boost: 1,
        characterName: "Any",
        tags: [],
        effects: ["CANCEL_EFFECTS"],
      },
      3,
      "any-fnt",
    ),
    ...createCards(
      {
        title: "Regroup",
        type: "VERSATILE",
        value: 1,
        boost: 1,
        characterName: "Any",
        tags: [],
        effects: ["DRAW_ONE_IF_COMBAT_WON_IF_WON_DRAW_TWO_INSTEAD"],
      },
      3,
      "any-reg",
    ),
    ...createCards(
      {
        title: "Riches Beyond Compare",
        type: "SCHEME",
        value: 0,
        boost: 1,
        characterName: "Sinbad",
        tags: [],
        effects: ["DRAW_THREE_CARDS"],
      },
      2,
      "sin-rich",
    ),
  ],
};
