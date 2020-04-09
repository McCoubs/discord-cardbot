import { GameType } from './gameType';
import { IGame } from './baseGame';
import { IUser } from '../mongo/models/user.model';
import { Blackjack } from './blackjack';

export class GameFactory {
  static createGame(type: GameType, owner: IUser): IGame {
    switch (type) {
      case GameType.blackjack:
        return new Blackjack(owner);
      default:
        return null;
    }
  }
}
