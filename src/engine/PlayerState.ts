import type { Card } from "../types/Card.ts";
import type { MoveContext } from "../types/Event.ts";

export class PlayerState {
  public hp: number;
  public hand: Card[] = [];
  public discard: Card[] = [];
  public deck: Card[];
  public passive: (ctx: MoveContext) => MoveContext;

  constructor(
    public readonly characterName: string,
    public readonly maxHp: number,
    public readonly baseMove: number,
    public readonly maxHandSize: number,
    startingDeck: Card[],
    passiveFn: (self: PlayerState, ctx: MoveContext) => MoveContext,
  ) {
    this.hp = maxHp;
    this.deck = [...startingDeck];
    this.passive = (ctx) => passiveFn(this, ctx);
    this.shuffle();
  }

  public shuffle() {
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
