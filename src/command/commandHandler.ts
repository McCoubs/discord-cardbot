import { Command } from './baseCommand';
import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { RedisCommand } from '../services/redisService';
import { getChannel } from '../utils/utils';
import { getLogger } from '../utils/logger';
import { MongoConnector } from '../mongo/mongoConnector';
import { User } from '../mongo/models/user.model';
import { DiscordService } from '../services/discordService';
import { RedisQueueService } from '../services/redisQueueService';
import { Service } from '../di/serviceDecorator';
import { Injector } from '../di/injector';
import { Test } from './test';

const logger = getLogger('commands');

@Service()
export class CommandHandler {
  commands = {};
  bot: Client;

  featureFlags = [
    {
      name: 'test',
      class: Test,
      active: process.env.DISCORDBOT_ENV !== 'production',
    }
  ];

  constructor(public ds: DiscordService, rsq: RedisQueueService, mc: MongoConnector) {
    this.bot = ds.client;
    let bot = this.bot;

    this.featureFlags.forEach(f => {
      if (f.active) {
        this.addCommand(f.name, Injector.resolve<Command>(f.class))
      }
    });

    rsq.onMessage((rc: RedisCommand) => {
      if (rc.command == 'help') {
        return getChannel(bot, rc).then((channel: TextChannel) => {
          let embed = new MessageEmbed().setDescription(this.getHelp());
          channel.send(embed).catch(logger.error);
        });
      }

      const channelPromise = getChannel(bot, rc);
      const userPromise = User.findOne({ discord_id: rc.data.user_id })
        .then(u => {
          if (u == null) {
            return new User({ discord_id: rc.data.user_id }).save();
          }
          return Promise.resolve(u);
        });

      Promise.all([userPromise, channelPromise]).then(results => {
        rc.user = results[0];
        rc.channel = (results[1] as TextChannel);
        this.execute(rc);
      });
    })
  }

  addCommand(name: string, command: Command) {
    this.commands[name] = command;
  }

  getHelp(): string {
    let out = '';
    if (this.getVersion()) {
      out += `Version ${this.getVersion()}\n`;
    }
    for (let c in this.commands) {
      let cmd: Command = this.commands[c];
      out += `\`${c}\`: ${cmd.helpString}\n`;
      if (cmd.exampleString != '') out += `\t_${cmd.exampleString}_\n`;
    }
    return out;
  }

  getVersion(): string {
    return process.env.BOT_VERSION;
  }

  execute(msg: RedisCommand) {
    let command: Command = this.commands[msg.command];
    if (command) {
      command.execute(msg);
    } else {
      logger.warn(`No command '${msg.command}'`);
    }
  }
}
