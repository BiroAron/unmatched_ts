# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript implementation of the [Unmatched](https://restorationgames.com/unmatched/) board game engine. Currently models combat resolution, card effects, movement, and map traversal — no UI, runs via `console.log` output.

## Commands

```bash
npm start          # Run src/index.ts (one-shot simulation)
npm run dev        # Watch mode (restarts on file change)
npx tsc --noEmit   # Type-check without emitting (noEmit is set in tsconfig)
npx eslint .       # Lint
```

There is no test framework — `src/index.ts` serves as the manual test harness with inline assertions via console output.

## Architecture

### Core flow

```
index.ts
  → constructs GameEngine(mapData) + PlayerState(characterData) per player
  → registers character passive hooks on engine.bus
  → calls engine.resolveCombat() / engine.resolveScheme()
```

### Engine layer (`src/engine/`)

- **`GameEngine`** — orchestrates combat and movement. `resolveCombat` runs effects in three phases: `immediately` → `duringCombat` → `afterCombat`. Each phase calls both `applyEffects` (inline card effects) and `bus.emit` (passive hooks). `resolveScheme` handles scheme cards outside combat.
- **`EventBus`** — typed pub/sub. Handlers receive a context object and must return it (pipeline pattern). Characters subscribe passive abilities here via `registerHooks`.
- **`PlayerState`** — mutable runtime state: hp, deck/hand/discard piles, current map position, turn movement tracking.
- **`GameMap`** — BFS-based graph of `Space` nodes. `getDistance` and `getAvailableMoves` block movement through enemy-occupied spaces.

### Type layer (`src/types/`)

- **`Card.ts`** — `Card` and `CardEffect` interfaces. Effects declare `phase`, `type`, optional `condition`, `target`, and `value`. The `EffectPhase` union drives execution ordering.
- **`Event.ts`** — `CombatContext` and `MoveContext` are passed through the event bus. `EventMap` maps phase names to their context types.
- **`GameMap.ts`** — `Space` (id, zones[], neighbors[]) and `MapData`.

### Config layer (`src/config/`)

- **`card-effects/general.ts`** — `EFFECT_LOGIC` record maps effect type strings to handler functions `(effect, actor, context, target, bus) => void`. Add new generic effect types here.
- **`config/characters/`** — one file per character. Each exports a `CharacterData` object containing the full deck (built with the `createCards` helper) and a `registerHooks` function for passive abilities. Character-specific custom effect instructions (e.g. `"RETURN_ALL_VOYAGES_TO_HAND"`) are handled inside `registerHooks` by subscribing to the `customEffect` event on the bus.

### Adding a new character

1. Create `src/config/characters/<Name>.ts` exporting a `CharacterData`.
2. Define the deck using `createCards(template, quantity, idPrefix)`.
3. Implement `registerHooks` to subscribe passive abilities to `engine.bus`.
4. Wire up in `src/index.ts`: construct `PlayerState`, call `registerHooks`.

### Adding a new card effect type

1. Add the type string to the `CardEffect.type` union in `src/types/Card.ts`.
2. Add the handler to `EFFECT_LOGIC` in `src/config/card-effects/general.ts`.

## TypeScript config notes

Strict mode is maxed out: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`. Import paths must include the `.ts` extension (e.g. `import { Foo } from "./Foo.ts"`). No emit — run directly with `tsx`.
