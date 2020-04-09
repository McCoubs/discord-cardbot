import { BaseCommand } from './baseCommand';
import { RedisCommand } from '../services/redisService';
import { environment } from '../config/environment';

export class JoinCommand extends BaseCommand {
  name = 'join';
  helpString = 'Join an active game.';
  exampleString = `${environment.bot.prefix}join`;

  execute(rc: RedisCommand) {
    this.send(rc, this.gs.joinGame(rc.user));
  }
}
