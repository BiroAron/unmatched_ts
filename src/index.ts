import { GameEngine } from "./engine/GameEngine.ts";
import { PlayerState } from "./engine/PlayerState.ts";
import type { Card } from "./types/Card.ts";

const engine = new GameEngine();

const voyageCard: Card = {
  id: "v1",
  title: "Voyage 1",
  type: "ATTACK",
  value: 3,
  boost: 2,
  characterName: "Sinbad",
  tags: ["voyage"],
};

const sinbad = new PlayerState("Sinbad", 15, 2, 7, [], (self, ctx) => {
  if (ctx.player !== self) return ctx;
  const voyages = ctx.player.getDiscardCountByTag("voyage");
  ctx.bonusMove += voyages;
  console.log(`[Passive] Sinbad's voyages found: ${voyages}. Adding bonus.`);
  return ctx;
});

const sinbad2 = new PlayerState("Sinbad2", 15, 2, 7, [], (self, ctx) => {
  if (ctx.player !== self) return ctx;
  const voyages = ctx.player.getDiscardCountByTag("voyage");
  ctx.bonusMove += voyages;
  console.log(`[Passive] Sinbad2's voyages found: ${voyages}. Adding bonus.`);
  return ctx;
});

sinbad.discard.push(
  { ...voyageCard, id: "v1a" },
  { ...voyageCard, id: "v1b" },
  { ...voyageCard, id: "v1c" },
);

sinbad2.discard.push(
  { ...voyageCard, id: "v2a" },
  { ...voyageCard, id: "v2b" },
);

engine.bus.subscribe("beforeMovement", sinbad.passive);
engine.bus.subscribe("beforeMovement", sinbad2.passive);

engine.addPlayer(sinbad);
engine.addPlayer(sinbad2);

console.log("--- Starting Test ---");
engine.maneuver("Sinbad");
engine.maneuver("Sinbad2");
console.log("--- Test Complete ---");
