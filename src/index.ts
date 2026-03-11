import { SINBAD_DATA } from "./config/characters/Sinbad.ts";
import { TEST_SINBAD_DATA } from "./config/characters/SinbadTest.ts";
import { GameEngine } from "./engine/GameEngine.ts";
import { PlayerState } from "./engine/PlayerState.ts";

const engine = new GameEngine();
const p1 = new PlayerState(SINBAD_DATA);
const p2 = new PlayerState(TEST_SINBAD_DATA);

engine.addPlayer(p1);
engine.addPlayer(p2);

// Register Passives
SINBAD_DATA.registerHooks(engine.bus, p1);
TEST_SINBAD_DATA.registerHooks(engine.bus, p2);

console.log("--- STARTING SIMULATED TESTS ---");

// --- TEST 1: Momentous Shift Value Set ---
console.log("\nTEST 1: Momentous Shift");
const momShift = p1.deck.find((c) => c.title === "Momentous Shift")!;
const regroup = p2.deck.find((c) => c.title === "Regroup")!;

engine.resolveCombat(p1, p2, momShift, regroup);
// Output should show Attack 5 vs Defense 1 = 4 Damage.

p2.hp = p2.maxHp;

// --- TEST 2: Feint vs Regroup (Cancellation) ---
console.log("\nTEST 2: Feint vs Regroup");
const feint = p2.deck.find((c) => c.title === "Feint")!;

// P1 attacks with Regroup (Value 1, Draw 1 if won)
// P2 defends with Feint (Value 2, Immediate: Cancel)
const p1HandBefore = p1.hand.length;
engine.resolveCombat(p1, p2, regroup, feint);

console.log(
  `P1 Hand Size Change: ${p1.hand.length - p1HandBefore} (Expected: 0)`,
);
// Damage should be 0 (1 vs 2). Even though P2 "won", Feint cancelled Regroup's draw effect.

// --- TEST 3: Voyage Scaling ---
console.log("\nTEST 3: Voyage Scaling (2 in Discard)");
const voyageCard = p1.deck.find((c) => c.tags.includes("voyage"))!;
// Mock discard pile
p1.discard.push(voyageCard, voyageCard);

engine.resolveCombat(p1, p2, voyageCard, regroup);
// Expected: Base 2 + 2 from discard = 4 Attack vs 1 Defense = 3 Damage.

// --- TEST 4: Voyage Home (Custom Logic) ---
console.log("\nTEST 4: Voyage Home");
const voyageHome = p1.deck.find((c) => c.title === "Voyage Home")!;
engine.resolveCombat(p1, p2, voyageHome, regroup);
console.log(
  `${p1.characterName} Discard count: ${p1.discard.length} (Expected: 0 or 1 depending on if current card is discarded yet)`,
);

// TEST 5: Riches Beyond Compare
const richesCard = p1.deck.find((c) => c.title === "Riches Beyond Compare")!;
const handBefore = p1.hand.length;

engine.resolveScheme(p1, richesCard);
