import { BaseCommand } from './baseCommand';
import { RedisCommand } from '../services/redisService';

export class TestCommand extends BaseCommand {
  name = 'test';

  execute(rc: RedisCommand) {
    this.send(rc, `test response: ${JSON.stringify(rc.arguments)}`);
  }
}
