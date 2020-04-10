export interface Card {
  rank: string;
  suit: string;
  hidden: boolean;
}

export class CardManager {
  static drawHand(hand: Card[]): string {
    return hand.map((card: Card) => {
      return card.hidden ? `| ?????? |` : `| ${card.rank} of :${card.suit}: |`;
    }).join(`   `);
  }

  static convertCards(cards: { rank: { shortName: string, longName: string }, suit: { name: string } }[]): Card[] {
    return cards.map((card) => {
      return { rank: card.rank.shortName, suit: card.suit.name, hidden: false };
    })
  }
}
