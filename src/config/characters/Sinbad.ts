import type { Card } from "../../types/Card.ts";
import type { EventBus } from "../../engine/EventBus.ts";
import type { PlayerState } from "../../engine/PlayerState.ts";

export interface CharacterData {
  name: string;
  maxHp: number;
  deck: Card[];
  registerHooks: (bus: EventBus, player: PlayerState) => void;
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
    {
      id: "sinbad-v1",
      title: "To Scurry and Scavenge",
      type: "ATTACK",
      value: 2,
      boost: 2,
      characterName: "Sinbad",
      tags: ["voyage"],
      effectIds: [],
    },
    {
      id: "sinbad-v2",
      title: "To Scurry and Scavenge",
      type: "ATTACK",
      value: 2,
      boost: 2,
      characterName: "Sinbad",
      tags: ["voyage"],
      effectIds: [],
    },
    {
      id: "sinbad-v3",
      title: "To Scurry and Scavenge",
      type: "ATTACK",
      value: 2,
      boost: 2,
      characterName: "Sinbad",
      tags: ["voyage"],
      effectIds: [],
    },
    {
      id: "sinbad-v4",
      title: "To Scurry and Scavenge",
      type: "ATTACK",
      value: 2,
      boost: 2,
      characterName: "Sinbad",
      tags: ["voyage"],
      effectIds: [],
    },
    {
      id: "sinbad-v5",
      title: "To Scurry and Scavenge",
      type: "ATTACK",
      value: 2,
      boost: 2,
      characterName: "Sinbad",
      tags: ["voyage"],
      effectIds: [],
    },
    {
      id: "sinbad-v6",
      title: "To Scurry and Scavenge",
      type: "ATTACK",
      value: 2,
      boost: 2,
      characterName: "Sinbad",
      tags: ["voyage"],
      effectIds: [],
    },
    {
      id: "sinbad-v7",
      title: "To Scurry and Scavenge",
      type: "ATTACK",
      value: 2,
      boost: 2,
      characterName: "Sinbad",
      tags: ["voyage"],
      effectIds: [],
    },

    // --- CHARACTER SPECIFIC ---
    {
      id: "sinbad-e1",
      title: "Exploit",
      type: "VERSATILE",
      value: 3,
      boost: 2,
      characterName: "Sinbad",
      tags: [],
      effectIds: ["DRAW_1_ON_DAMAGE"],
    },
    {
      id: "sinbad-e2",
      title: "Exploit",
      type: "VERSATILE",
      value: 3,
      boost: 2,
      characterName: "Sinbad",
      tags: [],
      effectIds: ["DRAW_1_ON_DAMAGE"],
    },
    {
      id: "sinbad-r1",
      title: "Riches Beyond Compare",
      type: "SCHEME",
      value: 0,
      boost: 3,
      characterName: "Sinbad",
      tags: [],
      effectIds: ["VOYAGE_RECOVERY"],
    },

    // --- VERSATILE / MOVEMENT ---
    {
      id: "sinbad-l1",
      title: "Leap Away",
      type: "VERSATILE",
      value: 4,
      boost: 1,
      characterName: "Sinbad",
      tags: [],
      effectIds: ["MOVE_AFTER_COMBAT"],
    },
    {
      id: "sinbad-l2",
      title: "Leap Away",
      type: "VERSATILE",
      value: 4,
      boost: 1,
      characterName: "Sinbad",
      tags: [],
      effectIds: ["MOVE_AFTER_COMBAT"],
    },
    {
      id: "sinbad-d1",
      title: "Dash",
      type: "VERSATILE",
      value: 3,
      boost: 2,
      characterName: "Sinbad",
      tags: [],
      effectIds: ["MOVE_AFTER_COMBAT"],
    },
    {
      id: "sinbad-d2",
      title: "Dash",
      type: "VERSATILE",
      value: 3,
      boost: 2,
      characterName: "Sinbad",
      tags: [],
      effectIds: ["MOVE_AFTER_COMBAT"],
    },

    // --- DEFENSE / UTILITY ---
    {
      id: "sinbad-f1",
      title: "Feint",
      type: "VERSATILE",
      value: 2,
      boost: 2,
      characterName: "Sinbad",
      tags: [],
      effectIds: ["CANCEL_EFFECTS"],
    },
    {
      id: "sinbad-f2",
      title: "Feint",
      type: "VERSATILE",
      value: 2,
      boost: 2,
      characterName: "Sinbad",
      tags: [],
      effectIds: ["CANCEL_EFFECTS"],
    },
    {
      id: "sinbad-f3",
      title: "Feint",
      type: "VERSATILE",
      value: 2,
      boost: 2,
      characterName: "Sinbad",
      tags: [],
      effectIds: ["CANCEL_EFFECTS"],
    },

    // --- PORTER CARDS ---
    {
      id: "porter-h1",
      title: "Hired Help",
      type: "VERSATILE",
      value: 3,
      boost: 1,
      characterName: "Porter",
      tags: [],
      effectIds: [],
    },
    {
      id: "porter-b1",
      title: "By the Book",
      type: "VERSATILE",
      value: 3,
      boost: 1,
      characterName: "Porter",
      tags: [],
      effectIds: [],
    },
    {
      id: "porter-s1",
      title: "Second Serving",
      type: "SCHEME",
      value: 0,
      boost: 1,
      characterName: "Porter",
      tags: [],
      effectIds: ["SEARCH_DECK"],
    },
  ],
};
