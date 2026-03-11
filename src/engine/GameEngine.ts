import { EFFECT_LOGIC } from "../config/card-effects/general.ts";
import { type Card, type CardEffect, type EffectPhase } from "../types/Card.ts";
import type { CombatContext, MoveContext } from "../types/Event.ts";
import type { MapData } from "../types/GameMap.ts";
import { EventBus } from "./EventBus.ts";
import { GameMap } from "./GameMap.ts";
import { PlayerState } from "./PlayerState.ts";

export class GameEngine {
  public bus: EventBus;
  public players: PlayerState[] = [];
  public map: GameMap;

  constructor(mapData: MapData) {
    this.bus = new EventBus();
    this.map = new GameMap(mapData);
  }

  public addPlayer(player: PlayerState) {
    this.players.push(player);
    console.log(`Player ${player.characterName} added to the engine.`);
  }

  public canAttack(
    attacker: PlayerState,
    defender: PlayerState,
    rangeType: "MELEE" | "RANGED",
  ): boolean {
    const start = attacker.currentSpaceId;
    const target = defender.currentSpaceId;

    if (!start || !target) return false;

    if (rangeType === "MELEE") {
      return this.map.getDistance(start, target) === 1;
    }

    if (rangeType === "RANGED") {
      const isAdjacent = this.map.getDistance(start, target) === 1;
      const shareZone = this.map.areInSameZone(start, target);
      return isAdjacent || shareZone;
    }

    return false;
  }

  public movePlayer(
    player: PlayerState,
    targetSpaceId: string,
    availableMovePoints: number,
  ): boolean {
    const enemies = this.players
      .filter((p) => p !== player)
      .map((p) => p.currentSpaceId);

    const reachable = this.map.getAvailableMoves(
      player.currentSpaceId,
      availableMovePoints,
      enemies,
    );

    if (!reachable.includes(targetSpaceId)) {
      console.error(`Move failed: ${targetSpaceId} is unreachable or blocked.`);
      return false;
    }

    player.moveToSpace(targetSpaceId);
    console.log(`${player.characterName} moved to ${targetSpaceId}.`);
    return true;
  }

  private checkIfWon(context: CombatContext, player: PlayerState): boolean {
    const isAttacker = context.attacker === player;
    return isAttacker ? context.damageDealt > 0 : context.damageDealt === 0;
  }

  private applyEffects(phase: EffectPhase, context: CombatContext) {
    const participants = [
      { player: context.defender, card: context.defenseCard },
      { player: context.attacker, card: context.attackCard },
    ];

    for (const side of participants) {
      if (!side.card) continue;

      const activeEffects = side.card.effects.filter((e) => e.phase === phase);

      for (const effect of activeEffects) {
        if (
          effect.condition === "won" &&
          !this.checkIfWon(context, side.player)
        )
          continue;
        if (
          effect.condition === "lost" &&
          this.checkIfWon(context, side.player)
        )
          continue;

        this.executeEffect(effect, side.player, context);
      }
    }
  }

  private executeEffect(
    effect: CardEffect,
    actor: PlayerState,
    context: CombatContext,
  ) {
    if (effect.condition === "startedDifferentSpace") {
      if (!actor.hasMovedToDifferentSpace()) {
        console.log(
          `[Condition] ${effect.type} failed: Actor stayed on start space.`,
        );
        return;
      }
    }

    let target = actor;
    if (effect.target === "opponent") {
      if (context && context.type === "combat") {
        target =
          actor === context.attacker ? context.defender : context.attacker;
      } else {
        return;
      }
    }

    const handler = EFFECT_LOGIC[effect.type];
    if (handler) {
      handler(effect, actor, context, target, this.bus);
    }
  }

  public resolveScheme(actor: PlayerState, card: Card) {
    console.log(
      `--- Scheme: ${card.title} played by ${actor.characterName} ---`,
    );

    const schemeEffects = card.effects.filter((e) => e.phase === "scheme");

    for (const effect of schemeEffects) {
      this.executeEffect(effect, actor, { type: "combat" } as CombatContext);
    }

    actor.discard.push(card);
    actor.hand = actor.hand.filter((c) => c.id !== card.id);
  }

  public resolveCombat(
    attacker: PlayerState,
    defender: PlayerState,
    attackCard: Card,
    defenseCard: Card,
  ) {
    if (!this.canAttack(attacker, defender, attacker.rangeType)) {
      console.warn(
        `Combat cancelled: ${attacker.characterName} (${attacker.rangeType}) cannot reach ${defender.characterName}.`,
      );
      return;
    }

    let context: CombatContext = {
      type: "combat",
      attacker,
      defender,
      attackCard,
      defenseCard,
      attackModifier: 0,
      defenseModifier: 0,
      finalAttackValue: attackCard.value,
      finalDefenseValue: defenseCard.value,
      damageDealt: 0,
    };

    this.applyEffects("immediately", context);
    context = this.bus.emit("immediately", context);

    this.applyEffects("duringCombat", context);
    context = this.bus.emit("duringCombat", context);

    const totalAtk = context.finalAttackValue + context.attackModifier;
    const totalDef = context.finalDefenseValue + context.defenseModifier;
    context.damageDealt = Math.max(0, totalAtk - totalDef);

    console.log(
      `${context.attacker.characterName} attacks with ${context.attackCard.title} (Value: ${context.finalAttackValue}, Modifier: ${context.attackModifier}, Total: ${totalAtk})`,
    );
    console.log(
      `${context.defender.characterName} defends with ${context.defenseCard.title} (Value: ${context.finalDefenseValue}, Modifier: ${context.defenseModifier}, Total: ${totalDef})`,
    );

    context.defender.takeDamage(context.damageDealt);
    console.log(
      `${context.defender.characterName} took ${context.damageDealt} damage! (Remaining: ${context.defender.hp})`,
    );

    this.applyEffects("afterCombat", context);
    this.bus.emit("afterCombat", context);
  }
}
