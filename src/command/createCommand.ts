import { BaseCommand } from './baseCommand';
import { RedisCommand } from '../services/redisService';
import { GameType } from '../games/gameType';
import { environment } from '../config/environment';

export class CreateCommand extends BaseCommand {
  name = 'create';
  helpString = 'Create a new game to play';
  exampleString = `${environment.bot.prefix}create blackjack`;

  execute(rc: RedisCommand) {
    let success;
    switch (rc.arguments[0]) {
      case 'blackjack':
        success = this.gs.createGame(GameType.blackjack, rc.user);
        break;
      default:
        return this.send(rc, `${rc.arguments[0]} is not a valid game, try choosing one of ${GameType.blackjack}.`);
    }
    if (success) {
      this.send(rc, `You have successfully started a game of ${rc.arguments[0]}.\n`
          + `Other players type \`${environment.bot.prefix}join\` to join the game.\nType `
          + `\`${environment.bot.prefix}start\` to start the game whenever you are ready.`
      );
    } else {
      this.send(rc, `There is a game currently in progress.\nThe owner of the current game`
          + `must either type \`${environment.bot.prefix}clear\` before trying to create a new game\nor`
          + `type \`${environment.bot.prefix}restart\` to restart the current game.`
      );
    }
  }
}
