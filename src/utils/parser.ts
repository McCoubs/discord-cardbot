import { parse, ParsedMessage } from 'discord-command-parser';
import { Message } from 'discord.js';
import { environment } from '../config/environment';

export class Parser {
  parse(s: Message): ParsedMessage {
    return parse(s, environment.bot.prefix);
  }
}
