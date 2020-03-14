import {Ndefine} from "./ndefine";
import {Top} from "./top";
import {Command} from "./baseCommand";
import {Client, TextChannel} from "discord.js";
import RedisSMQ, {QueueMessage} from "rsmq";
import {RedisCommand, RedisConnector} from "../utils/redisConnector";
import {Define} from "./define";
import {getChannel} from "../utils/utils";
import {getLogger} from "../utils/logger";
import {Me} from "./me";

const logger = getLogger('commands');

export class CommandHandler {
  commands = {};
  bot: Client;

  constructor(bot: Client, rsmq: RedisSMQ) {
    this.bot = bot;
    this.addCommand('ndefine', new Ndefine(bot));
    this.addCommand('top', new Top(bot));
    this.addCommand('define', new Define(bot));
    this.addCommand('me', new Me(bot));

    // on command message
    let redis = RedisConnector.getInstance();
    redis.client.on("message", (m) => {
      rsmq.getQueueAttributes({qname: redis.qname}, (err, resp) => {
        if (err) return logger.error(err);

        for (let i = 0; i < resp.msgs; i++) {
          redis.rsmq.popMessage({qname: redis.qname}, (err, msg: QueueMessage) => {
            if (err) return logger.error(err);
            if (!msg.message) return;
            logger.debug("Recieved: " + msg.message);
            let data: RedisCommand = JSON.parse(msg.message);
            if (data.command == 'help') {
              return getChannel(bot, data).then((channel: TextChannel) => {
                channel.send(this.getHelp()).catch(logger.error);
              });
            } else {
              this.execute(data);
            }
          });
        }
      });
    });
  }

  addCommand(name: string, command: Command) {
    this.commands[name] = command;
  }

  getHelp(): string {
    let out = "";
    for (let c in this.commands) {
      let cmd: Command = this.commands[c];
      out += `\`${c}\`: ${cmd.helpString}\n`;
      if (cmd.exampleString != '') out += `\t_${cmd.exampleString}_\n`;
    }
    return out;
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