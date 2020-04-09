import { environment } from '../config/environment';
import redis from 'redis';
import { getLogger } from '../utils/logger';
import axios, { AxiosRequestConfig } from 'axios';
import lru from 'redis-lru';
import { promisify } from 'util';
import { TextChannel } from 'discord.js';
import { IUser } from '../mongo/models/user.model';
import { Service } from '../di/serviceDecorator';

export interface RedisCommand {
  command: string
  arguments: string[]
  data: {
    guild_id: string
    message_id: string
    channel_id: string
    user_id: string
    content: string
    channel_type: string
  },
  channel?: TextChannel,
  user?: IUser
}

const logger = getLogger('redis');

@Service()
export class RedisService {
  private static _instance: RedisService;
  client: redis.RedisClient;
  pagesCache;
  generalLru;


  constructor() {
    this.client = redis.createClient({host: environment.redis.host,});
    this.pagesCache = lru(this.client, {max: 100, namespace: 'pages'});
    this.generalLru = lru(this.client, {max: 2000, namespace: 'general'});
    this.client.on('connect',() => logger.info('Ready'));
    RedisService._instance = this;
  }

  // this should only be used for request that serves static data
  cachedRequest<T>(req: AxiosRequestConfig, lru: boolean = false): Promise<T> {
    let get;
    let set;
    if (lru) {
      get = this.generalLru.get;
      set = this.generalLru.set;
    } else {
      get = promisify(this.client.get).bind(this.client);
      set = promisify(this.client.set).bind(this.client);
    }

    return get(req.url).then(reply => {
      // cache hit end here and return
      if (reply != null) {
        logger.debug(`Getting ${req.url} from ${lru ? 'lru ' : ''}cache`);
        return new Promise(resolve => resolve(JSON.parse(reply) as T));
      }

      // cache miss, make the request and save the response iff status code is 200
      logger.debug(`Getting ${req.url} from remote`);
      return axios.request<T>(req)
        .then(res => {
          if (res.status === 200 && res.data != null) set(req.url, JSON.stringify(res.data));
          return new Promise<T>(resolve => resolve(res.data));
        })
        .catch(err => {
          logger.debug(`Getting ${req.url} failed with ${err}`);
          return err;
        });
    });
  }

  static getInstance(): RedisService {
    return RedisService._instance || new RedisService();
  }

  set(key: string, val: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.set(key, JSON.stringify(val), (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

  get(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  }
}
