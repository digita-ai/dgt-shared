
/**
 * Asserts that the given condition is true. If it is not, an error is thrown.
 * The assertion function return type makes sure TypeScript takes the condition into account for type inference.
 *
 * Example usage:
 *
 * ```typescript
 * assert(true);    // always returns
 * assert(false);   // always throws
 *
 * const a = 'string';
 * const b: unknown = someFunction();
 * assert(a === b);                     // only returns if a === b
 * console.log(b.length);               // typescript knows that b is a string
 *
 * const c: unknown = someFunction();
 * assert(isNumber(c));                 // only returns if c is a number
 * console.log(1 + c);                  // typescript knows that c is a number
 * ```
 *
 * @param condition the condition to assert
 * @param message an optional message to display if the condition is false
 */

export const assert: (
  condition: boolean,
  message?: string,
) => asserts condition = (
  condition: boolean,
  message?: string,
): asserts condition => {

  if (!condition) throw new Error(message ?? `Assertion failed.`);

};

/**
 * Shorthand for a type assertion function for type `<T>`.
 */
export type TypeCheck<T> = (value: unknown) => value is T;

/**
 * Shorthand type assertion function for `value === null`.
 */
export const isNull: TypeCheck<null> = (value: unknown): value is null => value === null;

/**
 * Shorthand type assertion function for `value === undefined`.
 */
export const isUndefined: TypeCheck<undefined> = (value: unknown): value is undefined => value === undefined;

/**
 * Shorthand type assertion function for `value !== null && value !== null`.
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions -- does not work with type parameter
export function isDefined <V> (value: V): value is Exclude<V, null | undefined> {

  return value !== null && value !== undefined;

}

/**
 * Shorthand type assertion function for `typeof value === 'boolean'`.
 */
export const isBoolean: TypeCheck<boolean> = (value: unknown): value is boolean => typeof value === 'boolean';

/**
 * Shorthand type assertion function for `typeof value === 'number'`.
 */
export const isNumber: TypeCheck<number> = (value: unknown): value is number => typeof value === 'number';

/**
 * Shorthand type assertion function for `typeof value === 'bigint'`.
 */
export const isBigInt: TypeCheck<bigint> = (value: unknown): value is bigint => typeof value === 'bigint';

/**
 * Shorthand type assertion function for `typeof value === 'string'`.
 */
export const isString: TypeCheck<string> = (value: unknown): value is string => typeof value === 'string';

/**
 * Shorthand type assertion function for `typeof value === 'symbol'`.
 */
export const isSymbol: TypeCheck<symbol> = (value: unknown): value is symbol => typeof value === 'symbol';

/**
 * Shorthand type assertion function for `typeof value === 'function'`.
 */
// eslint-disable-next-line @typescript-eslint/ban-types -- basic type check
export const isFunction: TypeCheck<Function> = (value: unknown): value is Function => typeof value === 'function';

/**
 * Shorthand type assertion function for `typeof value === object && value !== null`.
 */
export const isObject: TypeCheck<Record<string | number | symbol, unknown>> =
(value: unknown): value is Record<string | number | symbol, unknown> => typeof value === 'object' && value !== null;

