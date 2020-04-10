import { BaseCommand } from './baseCommand';
import { RedisCommand } from '../services/redisService';
import { environment } from '../config/environment';
import { GameType } from '../games/gameType';
import { Blackjack } from '../games/blackjack';

export class StartCommand extends BaseCommand {
  name = 'start';
  helpString = 'Start a created game.';
  exampleString = `${environment.bot.prefix}start`;

  execute(rc: RedisCommand) {
    this.gs.startGame(rc.user);
    switch (this.gs.currentGame.type) {
      case GameType.blackjack:
        // if blackjack, print out everyone's hands
        (this.gs.currentGame as Blackjack).printPrettyHands((hands: string[]) => {
          hands.forEach((hand: string) => this.send(rc, hand));
        });
        break;
      default:
        break;
    }
  }
}
