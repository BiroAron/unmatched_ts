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

  constructor(data: CharacterData) {
    this.characterName = data.name;
    this.maxHp = data.maxHp;
    this.hp = data.maxHp;
    this.deck = [...data.deck];

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
