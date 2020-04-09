import { Service } from '../di/serviceDecorator';
import { environment } from '../config/environment';
import { getLogger } from '../utils/logger';
import { GameType } from '../games/gameType';
import { IUser } from '../mongo/models/user.model';
import { IGame } from '../games/baseGame';
import { GameFactory } from '../games/gameFactory';

const logger = getLogger('games');

@Service()
export class GamesService {
  currentGame: IGame;
  resetTimer: NodeJS.Timeout;

  createGame(type: GameType, owner: IUser): boolean {
    // don't allow if a game is currently running
    if (this.isGameActive()) return false;

    // set a timer to clear the game in 30 minutes
    this.currentGame = GameFactory.createGame(type, owner);
    this.resetTimer = setTimeout(() => this.currentGame.clear(owner), 1800000);
    return true;
  }

  isGameActive(): boolean {
    return !!this.currentGame && this.currentGame.isActive();
  }

  clearGame(clearer: IUser): boolean {
    if (this.currentGame.clear(clearer)) {
      clearTimeout(this.resetTimer);
      return true;
    } else {
      return false;
    }
  }

  joinGame(player: IUser): string {
    return this.currentGame.join(player);
  }

  startGame(): boolean {
    this.resetTimer.refresh();
    this.currentGame.start();
    return true;
  }
}
