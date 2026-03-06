import { type Card } from "../types/Card.ts";
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
  }

  public maneuver(characterName: string) {
    const player = this.players.find((p) => p.characterName === characterName);
    if (!player) return;

    player.draw();

    const context: MoveContext = {
      type: "move",
      player: player,
      baseMove: player.baseMove,
      bonusMove: 0,
    };

    const finalContext = this.bus.emit("beforeMovement", context);

    const totalMove = finalContext.baseMove + finalContext.bonusMove;
    console.log(`${player.characterName} can move ${totalMove} spaces.`);

    this.bus.emit("afterMovement", { player, spacesMoved: totalMove });
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

    context = this.bus.emit("immediately", context);
    context = this.bus.emit("duringCombat", context);

    const totalAttack = context.finalAttackValue + context.attackModifier;
    const totalDefense = context.finalDefenseValue + context.defenseModifier;

    context.damageDealt = Math.max(0, totalAttack - totalDefense);

    context.defender.takeDamage(context.damageDealt);
    console.log(
      `${context.defender.characterName} took ${context.damageDealt} damage! (Remaining: ${context.defender.hp})`,
    );

    this.bus.emit("afterCombat", context);
  }
}
