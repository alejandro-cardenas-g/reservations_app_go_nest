export type ClassConstructor<T, K extends Array<any> = any[]> = {
  new (...args: K): T;
};
