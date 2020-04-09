import { Type } from './serviceDecorator';
import 'reflect-metadata';
import { getLogger } from '../utils/logger';

const logger = getLogger('injector');
export const Injector = new class {
  private instances = {};

  resolve<T>(target: Type<any>): T {
    // tokens are required dependencies, while injections are resolved tokens from the Injector
    let tokens = Reflect.getMetadata('design:paramtypes', target) || [],
      injections = tokens.map(token => {
        if (!this.instances[token.name]) {
          // logger.debug(`Making new ${token.name} instance`);
          this.instances[token.name] = Injector.resolve<any>(token);
        }
        return this.instances[token.name];
      });
    return new target(...injections);
  }
};
