import { BaseCommand } from './baseCommand';
import { RedisCommand } from '../services/redisService';
import { environment } from '../config/environment';

export class ClearCommand extends BaseCommand {
  name = 'clear';
  helpString = 'Clear an active game.';
  exampleString = `${environment.bot.prefix}clear`;

  execute(rc: RedisCommand) {
    this.send(rc, this.gs.clearGame(rc.user) ? 'Successfully cleared the active game.'
        : 'There was an issue clearing the active game.'
    );
  }
}
