import { GameType } from './gameType';
import { IUser } from '../mongo/models/user.model';
import { BaseGame } from './baseGame';
import { decks } from 'cards';
import { Card, CardManager } from './CardManager';
import { User } from 'discord.js';

export class Blackjack extends BaseGame {
  type: GameType = GameType.blackjack;
  activePlayer: IUser;
  hands: Map<string, Card[]>;
  deck;
  dealer: Card[];

  start(): boolean {
    super.start();
    this.dealHands();
    return true;
  }

  clear(caller: IUser): boolean {
    let success = super.clear(caller);
    this.activePlayer = null;
    this.hands = null;
    this.deck = null;
    this.dealer = null;
    return success;
  }

  dealHands(): void {
    this.hands = new Map<string, Card[]>();
    this.deck = new decks.StandardDeck();
    this.deck.shuffleAll();
    this.players.forEach((discord_id: string) => {
      let cards = CardManager.convertCards(this.deck.draw(2));
      cards[0].hidden = true;
      this.hands.set(discord_id, cards);
    });
    let cards = CardManager.convertCards(this.deck.draw(2));
    cards[0].hidden = true;
    this.dealer = cards
  }

  printPrettyHands(fn: (results: string[]) => void): void {
    const users = Promise.all([...this.hands.keys()].map((discord_id: string) => this.bot.users.fetch(discord_id)));
    users.then((users: User[]) => {
      fn(users.map((user: User) => `${user} ${CardManager.drawHand(this.hands.get(user.id))}`));
    });
  }
}
