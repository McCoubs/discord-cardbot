import { Message } from 'discord.js';
import { environment } from './config/environment';
import { CommandHandler } from './command/commandHandler';
import { getLogger } from './utils/logger';
import { Parser } from './utils/parser';
import { resolve } from 'path';
import { config } from 'dotenv';
import { Injector } from './di/injector';
import { DiscordService } from './services/discordService';
import { Service } from './di/serviceDecorator';
import { RedisQueueService } from './services/redisQueueService';
import { ParsedMessage } from 'discord-command-parser';

const logger = getLogger();

if (process.env.NODE_ENV !== 'production') {
  config({path: resolve(__dirname, '../../.env')});
}

@Service()
class Main {
  constructor(public ds: DiscordService, public rqs: RedisQueueService) {
    let bot = ds.client;
    switch (environment.mode) {
      case 'publisher':
        logger.info('Starting publisher...');

        let parser = new Parser();
        // listen to every message, pushing onto redis queue
        bot.on('message', (message: Message) => {
          if (message.author.bot) return;
          let pm: ParsedMessage = parser.parse(message);
          if (!pm.success) return;
          this.rqs.sendCommand(pm).catch(logger.error);
        });
        break;
      case 'subscriber':
        logger.info('Starting subscriber...');
        Injector.resolve(CommandHandler);
        break;
      default:
        throw new Error("Invalid DISCORDBOT_MODE. only 'subscriber' or 'publisher'");
    }
    ds.login();
  }
}
Injector.resolve(Main);
