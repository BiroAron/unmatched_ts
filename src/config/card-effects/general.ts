import type { EventBus } from "../../engine/EventBus.ts";
import type { PlayerState } from "../../engine/PlayerState.ts";
import type { CardEffect } from "../../types/Card.ts";
import type { CombatContext } from "../../types/Event.ts";

type EffectFunction = (
  effect: CardEffect,
  actor: PlayerState,
  context: CombatContext,
  target: PlayerState,
  bus: EventBus,
) => void;

export const EFFECT_LOGIC: Record<string, EffectFunction> = {
  draw: (effect, _actor, _ctx, target) => {
    for (let i = 0; i < (effect.value || 0); i++) target.draw();
  },

  damage: (effect, _actor, _ctx, target) => {
    target.takeDamage(effect.value || 0);
  },

  recoverHp: (effect, _actor, _ctx, target) => {
    target.hp = Math.min(target.maxHp, target.hp + (effect.value || 0));
  },

  lookAtOpponentHand: (_eff, _actor, _ctx, target) => {
    const cardTitles = target.hand.map((c) => c.title).join(", ");
    console.log(
      `[Effect] Looking at ${target.characterName}'s hand: [ ${cardTitles} ]`,
    );
  },

  valueSet: (effect, actor, context) => {
    if (actor === context.attacker) {
      context.finalAttackValue = effect.value ?? context.finalAttackValue;
    } else {
      context.finalDefenseValue = effect.value ?? context.finalDefenseValue;
    }
    console.log(`${actor.characterName} value set to ${effect.value}`);
  },

  cancel: (_eff, actor, context) => {
    const opponentCard =
      actor === context.attacker ? context.defenseCard : context.attackCard;
    if (opponentCard) {
      opponentCard.effects = opponentCard.effects.filter(
        (e) => e.phase === "immediately",
      );
      console.log(`CANCELLED: Effects on ${opponentCard.title} are gone!`);
    }
  },

  discard: (effect, _actor, _ctx, target) => {
    const amount = effect.value || 0;

    for (let i = 0; i < amount; i++) {
      if (target.hand.length === 0) {
        console.log(`${target.characterName} has no cards left to discard.`);
        break;
      }

      const cardToDiscard = target.hand.pop();
      if (cardToDiscard) {
        target.discard.push(cardToDiscard);
        console.log(
          `[Effect] ${target.characterName} discarded: ${cardToDiscard.title}`,
        );
      }
    }
  },

  custom: (effect, actor, context, _target, bus) => {
    if (!effect.instruction) return;
    bus.emit("customEffect", {
      instruction: effect.instruction,
      actor,
      context,
    });
  },
};
