import { GameEngine } from "./engine/GameEngine.ts";
import { PlayerState } from "./engine/PlayerState.ts";
import type { Card } from "./types/Card.ts";

const engine = new GameEngine();

const createDeck = (charName: string) => [
  {
    id: `${charName}1`,
    title: "Card",
    type: "VERSATILE",
    value: 3,
    boost: 1,
    characterName: charName,
    tags: [],
    effectIds: [],
  } as Card,
  {
    id: `${charName}2`,
    title: "Card",
    type: "VERSATILE",
    value: 3,
    boost: 1,
    characterName: charName,
    tags: [],
    effectIds: [],
  } as Card,
];

const strike: Card = {
  id: "s1",
  title: "Strike",
  type: "ATTACK",
  value: 3,
  boost: 1,
  characterName: "Chupacabra",
  tags: [],
  effectIds: [],
};
const block: Card = {
  id: "b1",
  title: "Block",
  type: "DEFENSE",
  value: 2,
  boost: 1,
  characterName: "Sinbad",
  tags: [],
  effectIds: [],
};

const chupacabra = new PlayerState(
  "Chupacabra",
  14,
  2,
  7,
  createDeck("Chupacabra"),
  (self, ctx) => {
    if (ctx.type === "combat" && ctx.attacker === self) {
      console.log(`>>> [PASSIVE] ${self.characterName} draws for attacking!`);
      self.draw();
    }
    return ctx;
  },
);

const sinbad = new PlayerState(
  "Sinbad",
  15,
  2,
  7,
  createDeck("Sinbad"),
  (self, ctx) => {
    if (ctx.type === "move" && ctx.player === self) {
      const voyages = self.getDiscardCountByTag("voyage");
      ctx.bonusMove += voyages;
      console.log(
        `>>> [PASSIVE] ${self.characterName} zooms +${voyages} spaces!`,
      );
    }
    return ctx;
  },
);

engine.addPlayer(chupacabra);
engine.addPlayer(sinbad);

sinbad.discard.push(
  { id: "v1", tags: ["voyage"] } as any,
  { id: "v2", tags: ["voyage"] } as any,
  { id: "v3", tags: ["voyage"] } as any,
);

engine.bus.subscribe("beforeMovement", (ctx) => sinbad.passive(sinbad, ctx));
engine.bus.subscribe("afterCombat", (ctx) =>
  chupacabra.passive(chupacabra, ctx),
);

console.log("--- SINBAD MANEUVERS ---");
engine.maneuver("Sinbad");

console.log("\n--- CHUPACABRA ATTACKS ---");
engine.resolveCombat(chupacabra, sinbad, strike, block);

console.log("\n--- STATUS CHECK ---");
console.log(`Sinbad HP: ${sinbad.hp}`);
console.log(`Chupacabra Hand Size: ${chupacabra.hand.length}`);
