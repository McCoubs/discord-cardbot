import { Service } from '../di/serviceDecorator';
import { environment } from '../config/environment';
import { getLogger } from '../utils/logger';
import { GameType } from '../games/gameType';
import { IUser } from '../mongo/models/user.model';
import { IGame } from '../games/baseGame';
import { GameFactory } from '../games/gameFactory';
import { DiscordService } from './discordService';

const logger = getLogger('games');

@Service()
export class GamesService {
  currentGame: IGame;
  resetTimer: NodeJS.Timeout;

  constructor(public ds: DiscordService) {}

  createGame(type: GameType, owner: IUser): boolean {
    // don't allow if a game is currently running
    if (this.isGameActive()) return false;

    // set a timer to clear the game in 30 minutes
    this.currentGame = GameFactory.createGame(this.ds.client, type, owner);
    this.resetTimer = setTimeout(() => this.currentGame.clear(owner), 1800000);
    return true;
  }

  isGameActive(): boolean {
    return !!this.currentGame && this.currentGame.isActive();
  }

  clearGame(clearer: IUser): boolean {
    if (this.currentGame.clear(clearer)) {
      this.currentGame = null;
      clearTimeout(this.resetTimer);
      return true;
    } else {
      return false;
    }
  }

  joinGame(player: IUser): string {
    return this.currentGame.join(player);
  }

  startGame(caller: IUser): string {
    this.resetTimer.refresh();
    if (!this.isGameActive()) {
      return `There is no game currently in progress.\nCreate a new game using the \`${environment.bot.prefix}create\` command.`
    }
    if (!this.currentGame.owner.matches(caller)) {
      return 'The owner of the game must be the one to start the game.'
    }
    if (!this.currentGame.start()) {
      return 'Unable to start the game due to complications';
    } else {
      return 'The game has been successfully started';
    }
  }
}
