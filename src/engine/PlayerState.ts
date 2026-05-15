import type { CharacterData } from "../types/Character.ts";
import { type Card } from "../types/Card.ts";
import type { SerializedPlayerState } from "../types/GameState.ts";

export class PlayerState {
  public characterId: string;
  public characterName: string;
  public hp: number;
  public maxHp: number;
  public baseMove: number = 2;
  public deck: Card[] = [];
  public hand: Card[] = [];
  public discard: Card[] = [];
  public turnStartSpaceId: string = "";
  public currentSpaceId: string = "";
  public spacesVisitedThisTurn: string[] = [];
  public pendingMovePoints: number = 0;
  public rangeType: "MELEE" | "RANGED";
  public onDeath?: () => void;

  constructor(data: CharacterData) {
    this.characterId = data.id;
    this.characterName = data.name;
    this.maxHp = data.maxHp;
    this.hp = data.maxHp;
    this.deck = [...data.deck];
    this.rangeType = data.rangeType;
    this.shuffle();
  }

  static fromSerialized(
    data: SerializedPlayerState,
    characterData: CharacterData,
  ): PlayerState {
    const player = new PlayerState(characterData);
    player.hp = data.hp;
    player.baseMove = data.baseMove;
    player.deck = [...data.deck];
    player.hand = [...data.hand];
    player.discard = [...data.discard];
    player.currentSpaceId = data.currentSpaceId;
    player.turnStartSpaceId = data.turnStartSpaceId;
    player.spacesVisitedThisTurn = [...data.spacesVisitedThisTurn];
    player.pendingMovePoints = data.pendingMovePoints;
    return player;
  }

  serialize(): SerializedPlayerState {
    return {
      characterId: this.characterId,
      characterName: this.characterName,
      hp: this.hp,
      maxHp: this.maxHp,
      baseMove: this.baseMove,
      rangeType: this.rangeType,
      deck: [...this.deck],
      hand: [...this.hand],
      discard: [...this.discard],
      currentSpaceId: this.currentSpaceId,
      turnStartSpaceId: this.turnStartSpaceId,
      spacesVisitedThisTurn: [...this.spacesVisitedThisTurn],
      pendingMovePoints: this.pendingMovePoints,
    };
  }

  private shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.deck[i];
      if (temp && this.deck[j]) {
        this.deck[i] = this.deck[j];
        this.deck[j] = temp;
      }
    }
  }

  public drawStartingHand(count = 5) {
    for (let i = 0; i < count; i++) this.draw();
  }

  public enforceHandLimit(limit = 7) {
    while (this.hand.length > limit) {
      const card = this.hand.pop()!;
      this.discard.push(card);
      console.log(`${this.characterName} discarded ${card.title} to hand limit.`);
    }
  }

  public resetTurnTracking(spaceId: string) {
    this.turnStartSpaceId = spaceId;
    this.currentSpaceId = spaceId;
    this.spacesVisitedThisTurn = [spaceId];
  }

  public moveToSpace(spaceId: string) {
    this.currentSpaceId = spaceId;
    if (!this.spacesVisitedThisTurn.includes(spaceId)) {
      this.spacesVisitedThisTurn.push(spaceId);
    }
  }

  public hasMovedToDifferentSpace() {
    return this.currentSpaceId !== this.turnStartSpaceId;
  }

  public draw() {
    const card = this.deck.pop();
    if (card) {
      this.hand.push(card);
      console.log(`${this.characterName} drew: ${card.title}`);
    } else {
      console.log(`${this.characterName} is exhausted! Taking 2 damage.`);
      this.takeDamage(2);
    }
  }

  public getDiscardCountByTag(tag: string) {
    return this.discard.filter((card) => card.tags.includes(tag)).length;
  }

  public takeDamage(amount: number) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) this.onDeath?.();
  }
}
