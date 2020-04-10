import { GameType } from './gameType';
import { IUser } from '../mongo/models/user.model';
import { environment } from '../config/environment';
import { Client } from 'discord.js';

export interface IGame {
  type: GameType
  players: Set<string>;
  owner: IUser;
  inProgress: boolean;

  isActive(): boolean;
  clear(caller: IUser): boolean;
  join(player: IUser): string;
  start(): boolean;
}

export class BaseGame implements IGame {
  type: GameType = GameType.base;
  players: Set<string>;
  owner: IUser;
  inProgress: boolean = false;
  bot: Client;

  constructor(bot: Client, owner: IUser) {
    this.players = new Set<string>([owner.discord_id]);
    this.owner = owner;
    this.bot = bot;
  }

  isActive(): boolean {
    return !!this.players && this.players.size > 0;
  }

  clear(caller: IUser): boolean {
    // if caller is the owner reset properties, otherwise disallow
    if (this.isActive() && this.owner.matches(caller)) {
      this.players.clear();
      this.owner = null;
      this.inProgress = false;
      return true;
    } else {
      return false;
    }
  }

  join(player: IUser): string {
    if (!this.isActive()) {
      return `There is no game currently in progress.\nCreate a new game using the \`${environment.bot.prefix}create\` command.`;
    }
    if (this.inProgress) {
      return 'Game is currently in progress, sorry you cannot join.';
    }
    if (this.players.has(player.discord_id)) {
      return 'You have already joined the game, please wait until it starts.'
    } else {
      this.players.add(player.discord_id);
      return 'You have successfully joined the game, please wait until it starts.'
    }
  }

  start(): boolean {
    this.inProgress = true;
    return true;
  }
}
