import { RedisCommand, RedisService } from '../services/redisService';
import { Channel, Client, TextChannel } from 'discord.js';
import { Logger } from 'winston';
import { getLogger } from '../utils/logger';
import { MongoConnector } from '../mongo/mongoConnector';
import { Service } from '../di/serviceDecorator';
import { DiscordService } from '../services/discordService';
import { GamesService } from '../services/gamesService';

export interface Command {
  name: string
  helpString: string
  exampleString?: string
  execute: (RedisCommand) => any
}

@Service()
export class BaseCommand implements Command {
  name: string = 'DEFAULT';
  helpString: string = 'DEFAULT HELP STRING';
  exampleString: string = '';
  bot: Client;
  logger: Logger = getLogger('commands');

  constructor(
    public ds: DiscordService,
    public mc: MongoConnector,
    public rs: RedisService,
    public gs: GamesService
  ) {
    this.bot = ds.client;
  }

  execute(message: RedisCommand) {
    return;
  }

  send(rc: RedisCommand, message): void {
    this.getChannel(rc).then((channel: TextChannel) => {
      channel.send(message).catch(this.logger.error);
    });
  }

  getChannel(rc: RedisCommand): Promise<Channel> {
    return this.bot.channels.fetch(rc.data.channel_id);
  }
}
