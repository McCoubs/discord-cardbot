import { Service } from '../di/serviceDecorator';
import { Client } from 'discord.js';
import { environment } from '../config/environment';
import { getLogger } from '../utils/logger';

const logger = getLogger('discord');

@Service()
export class DiscordService {
  client: Client;

  constructor() {
    this.client = new Client();
    this.client.on('ready', () => {
      this.client.user.setActivity(`${environment.bot.prefix}help`).catch(logger.error);
      logger.info('Ready');
    });
  }

  login() {
    this.client.login(environment.discord.auth.token).catch(logger.error);
  }
}
