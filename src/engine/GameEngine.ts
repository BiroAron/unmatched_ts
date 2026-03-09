import { EFFECT_LOGIC } from "../config/card-effects/general.ts";
import { type Card, type CardEffect, type EffectPhase } from "../types/Card.ts";
import type { CombatContext, MoveContext } from "../types/Event.ts";
import { EventBus } from "./EventBus.ts";
import { PlayerState } from "./PlayerState.ts";

export class GameEngine {
  public bus: EventBus;
  public players: PlayerState[] = [];

  constructor() {
    this.bus = new EventBus();
  }

  public addPlayer(player: PlayerState) {
    this.players.push(player);
    console.log(`Player ${player.characterName} added to the engine.`);
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
          `[Condition] ${effect.type} failed: Actor is still on their starting space.`,
        );
        return;
      }
      console.log(
        `[Condition] ${effect.type} met: Actor moved from ${actor.turnStartSpaceId} to ${actor.currentSpaceId}`,
      );
    }

    let target = actor;
    if (effect.target === "opponent") {
      if (context && context.type === "combat") {
        target =
          actor === context.attacker ? context.defender : context.attacker;
      } else {
        console.warn("Attempted to target 'opponent' outside of combat.");
        return;
      }
    }

    const handler = EFFECT_LOGIC[effect.type];

    if (handler) {
      handler(effect, actor, context, target, this.bus);
    } else {
      console.warn(`No handler implemented for effect type: ${effect.type}`);
    }
  }

  public resolveScheme(actor: PlayerState, card: Card) {
    console.log(
      `--- Scheme: ${card.title} played by ${actor.characterName} ---`,
    );

    const schemeEffects = card.effects.filter((e) => e.phase === "scheme");

    for (const effect of schemeEffects) {
      this.executeEffect(effect, actor, {} as CombatContext);
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
