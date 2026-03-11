import type { CharacterData } from "../config/characters/Sinbad.ts";
import { type Card } from "../types/Card.ts";

export class PlayerState {
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
  public rangeType: "MELEE" | "RANGED";

  constructor(data: CharacterData) {
    this.characterName = data.name;
    this.maxHp = data.maxHp;
    this.hp = data.maxHp;
    this.deck = [...data.deck];
    this.rangeType = data.rangeType;
    this.shuffle();
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
  }
}
