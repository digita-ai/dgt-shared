
import { TypeCheck, not, isNull, isUndefined, isBoolean, isNumber, isBigInt, isString, isSymbol, isFunction, assert } from './asserts';

const checks: [ string, TypeCheck<any>, unknown[] ][] = [
  [ 'isNull', isNull, [ null ] ],
  [ 'isUndefined', isUndefined, [ undefined ] ],
  [ 'isBoolean', isBoolean, [ true, false ] ],
  [ 'isNumber', isNumber, [ 1 ] ],
  [ 'isBigInt', isBigInt, [ BigInt(Number.MAX_SAFE_INTEGER) ] ],
  [ 'isString', isString, [ 'this is a string' ] ],
  [ 'isSymbol', isSymbol, [ Symbol('this is a symbol') ] ],
  [ 'isFunction', isFunction, [ () => ({}) ] ],
];

const allValues = checks.map(([ name, check, goodValues ]) => goodValues).flat();

const exampleFilter = (goodValues: unknown[]) => allValues.filter((value) => !goodValues.includes(value));

const goodMessage = 'should return true if the passed value is %p.';
const badMessage = 'should return false if the passed value is %p.';

describe.each(checks)('%s', (name, check: TypeCheck<any>, goodValues: unknown[]) => {

  it.each(goodValues)(goodMessage, (value) => expect(check(value)).toBe(true));
  it.each(exampleFilter(goodValues))(badMessage, (value) => expect(check(value)).toBe(false));

});

describe('not', () => {

  const msg = 'should return the opposite of %s.';
  it.each(checks)(msg, (name, check) => allValues.forEach((value) => expect(not(check)(value)).toBe(!check(value))));

});

describe('assert', () => {

  it('should complete if the condition is true', () => expect(() => assert(true)).toBeDefined());
  it('should throw an error if the condition is false', () => expect(() => assert(false)).toThrowError('Assertion failed.'));
  it('should throw a specific error if a message is specified', () => expect(() => assert(false, 'msg')).toThrowError('msg'));

});
