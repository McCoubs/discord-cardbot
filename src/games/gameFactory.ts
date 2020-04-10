import { GameType } from './gameType';
import { IGame } from './baseGame';
import { IUser } from '../mongo/models/user.model';
import { Blackjack } from './blackjack';
import { Client } from 'discord.js';

export class GameFactory {
  static createGame(bot: Client, type: GameType, owner: IUser): IGame {
    switch (type) {
      case GameType.blackjack:
        return new Blackjack(bot, owner);
      default:
        return null;
    }
  }
}
