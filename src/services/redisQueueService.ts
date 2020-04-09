import { Service } from '../di/serviceDecorator';
import redis from 'redis';
import { environment } from '../config/environment';
import { getLogger } from '../utils/logger';
import RedisSMQ, { QueueMessage } from 'rsmq-promise';
import { ParsedMessage } from 'discord-command-parser';
import { RedisCommand } from './redisService';
import { DiscordService } from './discordService';

const logger = getLogger('redis-queue');

@Service()
export class RedisQueueService {
  qname = 'DISCORDJOBS';
  ns = 'rsmq';
  client;
  rsmq: RedisSMQ;

  constructor(public ds: DiscordService) {
    this.client = redis.createClient({ host: environment.redis.host, });
    this.client.on('connect', () => logger.info('Ready'));
    this.client.subscribe(`${this.ns}:rt:${this.qname}`);
    this.rsmq = new RedisSMQ({
      host: environment.redis.host,
      port: environment.redis.port,
      ns: this.ns,
      realtime: true,
    });
    this.initializeQueues()
      .then(s => s ? logger.info('queue initialize success') : logger.error('queue initialize failed'));
  }

  onMessage(fn: CallableFunction) {
    this.client.on('message', () => {
      this.rsmq.getQueueAttributes({qname: this.qname}, (err, resp) => {
        if (err) return logger.error(err);
        for (let i = 0; i < resp.msgs; i++) {
          this.rsmq.popMessage({qname: this.qname}, (err, msg: QueueMessage) => {
            if (err) return logger.error(err);
            if (!msg.message) return;

            logger.debug('Received: ' + msg.message);
            let rc: RedisCommand = JSON.parse(msg.message);

            fn(rc);
          });
        }
      });
    });
  }


  sendCommand(pm: ParsedMessage): Promise<string> {
    let m = pm.message;
    let toSend: RedisCommand = {
      command: pm.command,
      arguments: pm.arguments,
      data: {
        guild_id: m.guild.id,
        message_id: m.id,
        channel_id: m.channel.id,
        user_id: m.author.id,
        content: m.content,
        channel_type: m.channel.type
      }
    };
    let p = this.rsmq.sendMessage({qname: this.qname, message: JSON.stringify(toSend)});
    p.then(() => logger.debug('Sending ' + JSON.stringify(toSend)));
    p.catch(logger.error);
    return p;
  }

  private initializeQueues(): Promise<boolean> {
    return this.rsmq.listQueues()
      .then(q => {
        if (!q.includes(this.qname)) {
          logger.info('Creating queues');
          this.rsmq.createQueue({qname: this.qname}, function (err, resp) {
            if (err) return logger.error(err);
            if (resp) return logger.info('Created redis queue');
          });
        } else {
          logger.info('Redis queues exist, skipping create');
        }
        return Promise.resolve(true);
      })
      .catch(err => {
        logger.error(err);
        return Promise.resolve(false);
      });
  }
}
