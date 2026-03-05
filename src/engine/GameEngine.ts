import type { MoveContext } from "../types/Event.ts";
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
    if (!player) {
      console.error(`Player ${characterName} not found!`);
      return;
    }

    player.draw();

    const context: MoveContext = {
      player: player,
      bonusMove: 0,
    };

    const finalContext = this.bus.emit("beforeMovement", context);

    const totalMove = finalContext.player.baseMove + finalContext.bonusMove;
    console.log(`${player.characterName} can move ${totalMove} spaces.`);

    this.bus.emit("afterMovement", { player });
  }
}
