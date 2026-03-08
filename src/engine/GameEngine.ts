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
    if (effect.condition === "startedDifferentZone") {
      //if (actor.currentZoneId === actor.turnStartZoneId) {
      return; // Condition not met, skip this effect
      //}
    }

    const target =
      effect.target === "opponent"
        ? actor === context.attacker
          ? context.defender
          : context.attacker
        : actor;

    switch (effect.type) {
      case "draw":
        for (let i = 0; i < (effect.value || 0); i++) target.draw();
        break;

      case "damage":
        target.takeDamage(effect.value || 0);
        break;

      case "recoverHp":
        target.hp = Math.min(target.maxHp, target.hp + (effect.value || 0));
        break;

      case "lookAtOpponentHand":
        console.log(`Attempting to look at ${target.characterName}'s hand...`);
        break;

      case "valueSet":
        if (actor === context.attacker) {
          context.finalAttackValue = effect.value ?? context.finalAttackValue;
        } else {
          context.finalDefenseValue = effect.value ?? context.finalDefenseValue;
        }
        console.log(`${actor.characterName} value set to ${effect.value}`);
        break;

      case "cancel":
        const opponentCard =
          actor === context.attacker ? context.defenseCard : context.attackCard;
        if (opponentCard) {
          opponentCard.effects = opponentCard.effects.filter(
            (e) => e.phase === "immediately",
          );
          console.log(`CANCELLED: Effects on ${opponentCard.title} are gone!`);
        }
        break;

      case "custom":
        if (!effect.instruction) {
          console.warn("Custom effect missing instruction, skipping.");
          return;
        }
        this.bus.emit("customEffect", {
          instruction: effect.instruction,
          actor,
          context,
        });
        break;
    }
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
