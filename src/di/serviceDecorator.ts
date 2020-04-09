export type GenericClassDecorator<T> = (target: T) => void;
import 'reflect-metadata'
export interface Type<T> {
  new(...args: any[]): T;
}

export const Service = (): GenericClassDecorator<Type<Object>> => {
  return (target: Type<Object>) => {};
};
