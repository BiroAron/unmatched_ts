import type { Card } from "../../types/Card.ts";
import type { EventBus } from "../../engine/EventBus.ts";
import type { PlayerState } from "../../engine/PlayerState.ts";
import type { CombatContext } from "../../types/Event.ts";

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
) {
  return Array.from({ length: quantity }).map((_, i) => ({
    ...template,
    id: `${prefix}-${i + 1}`,
  }));
}

export const SINBAD_CUSTOM_EFFECTS: Record<
  string,
  (actor: PlayerState, context: CombatContext) => void
> = {
  RETURN_ALL_VOYAGES_TO_HAND: (actor) => {
    const voyages = actor.discard.filter((c) => c.tags.includes("voyage"));
    actor.hand.push(...voyages);
    actor.discard = actor.discard.filter((c) => !c.tags.includes("voyage"));
    console.log("Voyages returned!");
  },
};

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

    bus.subscribe("customEffect", (ctx) => {
      const { instruction, actor } = ctx;

      console.log(
        `Custom effect triggered: ${instruction} by ${actor.characterName}`,
      );

      if (instruction === "RETURN_ALL_VOYAGES_TO_HAND" && actor === player) {
        const voyages = actor.discard.filter((c) => c.tags.includes("voyage"));
        actor.hand.push(...voyages);
        actor.discard = actor.discard.filter((c) => !c.tags.includes("voyage"));
        console.log("Sinbad's voyages returned to hand!");
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
        effects: [{ phase: "afterCombat", type: "draw", value: 1 }],
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
        effects: [{ phase: "afterCombat", type: "draw", value: 2 }],
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
        effects: [{ phase: "afterCombat", type: "move", value: 2 }],
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
        effects: [
          {
            phase: "afterCombat",
            target: "opponent",
            type: "discard",
            value: 1,
          },
        ],
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
        effects: [{ phase: "afterCombat", type: "draw", value: 1 }],
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
        effects: [{ phase: "afterCombat", type: "lookAtOpponentHand" }],
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
        effects: [
          {
            phase: "afterCombat",
            type: "custom",
            instruction: "RETURN_ALL_VOYAGES_TO_HAND",
          },
        ],
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
        effects: [{ phase: "afterCombat", type: "damage", value: 2 }],
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
        effects: [{ phase: "afterCombat", type: "recoverHp", value: 2 }],
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
        effects: [{ phase: "afterCombat", type: "draw", value: 1 }],
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
        effects: [
          { phase: "afterCombat", type: "move", target: "choose", value: 4 },
        ],
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
        effects: [
          {
            phase: "duringCombat",
            type: "valueSet",
            condition: "startedDifferentSpace",
            value: 5,
          },
        ],
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
        effects: [{ phase: "afterCombat", type: "move", value: 3 }],
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
        effects: [{ phase: "immediately", type: "cancel" }],
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
        effects: [
          { phase: "afterCombat", type: "draw", value: 1, condition: "won" },
          { phase: "afterCombat", type: "draw", value: 2, condition: "lost" },
        ],
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
        effects: [{ phase: "scheme", type: "draw", value: 3 }],
      },
      2,
      "sin-rich",
    ),
  ],
};
