
export type TypeCheck<T> = (value: unknown) => value is T;

export const not: <X> (check: TypeCheck<X>) => <V> (value: V) => value is Exclude<V, X>
= <X> (check: TypeCheck<X>) => <V> (value: V): value is Exclude<V, X> => !check(value);

export const isNull: TypeCheck<null> = (value: unknown): value is null => value === null;
export const isUndefined: TypeCheck<undefined> = (value: unknown): value is undefined => value === undefined;

export const isBoolean: TypeCheck<boolean> = (value: unknown): value is boolean => typeof value === 'boolean';
export const isNumber: TypeCheck<number> = (value: unknown): value is number => typeof value === 'number';
export const isBigInt: TypeCheck<bigint> = (value: unknown): value is bigint => typeof value === 'bigint';
export const isString: TypeCheck<string> = (value: unknown): value is string => typeof value === 'string';
export const isSymbol: TypeCheck<symbol> = (value: unknown): value is symbol => typeof value === 'symbol';

// eslint-disable-next-line @typescript-eslint/ban-types -- basic type check
export const isFunction: TypeCheck<Function> = (value: unknown): value is Function => typeof value === 'function';

export const assert: (
  condition: boolean,
  messageOrCatch?: string | (() => void),
) => asserts condition = (
  condition: boolean,
  messageOrCatch?: string | (() => void),
): asserts condition => {

  if (!condition) if (isFunction(messageOrCatch)) messageOrCatch(); else throw new Error(messageOrCatch ?? `Assertion failed.`);

};
