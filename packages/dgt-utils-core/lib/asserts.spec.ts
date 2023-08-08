
import { TypeCheck, isNull, isUndefined, isBoolean, isNumber, isBigInt, isString, isSymbol, isFunction, assert, isDefined, isObject } from './asserts';

const definedChecks: [ string, TypeCheck<any>, unknown[] ][] = [
  [ 'isBoolean', isBoolean, [ true, false ] ],
  [ 'isNumber', isNumber, [ 1 ] ],
  [ 'isBigInt', isBigInt, [ BigInt(Number.MAX_SAFE_INTEGER) ] ],
  [ 'isString', isString, [ 'this is a string' ] ],
  [ 'isSymbol', isSymbol, [ Symbol('this is a symbol') ] ],
  [ 'isFunction', isFunction, [ () => ({}) ] ],
  [ 'isObject', isObject, [ {}, { 'some': 'field' }, { 1: 'other' }, { [Symbol('symbol')]: 'fields' } ] ],
];

const definedValues = definedChecks.map(([ , , goodValues ]) => goodValues).flat();

const undefinedChecks: [ string, TypeCheck<any>, unknown[] ][] = [
  [ 'isNull', isNull, [ null ] ],
  [ 'isUndefined', isUndefined, [ undefined ] ],
];

const undefinedValues = undefinedChecks.map(([ , , goodValues ]) => goodValues).flat();

const allChecks = definedChecks.concat(undefinedChecks).concat([ [ 'isDefined', isDefined, definedValues ] ]);

const allValues = definedValues.concat(undefinedValues);

const exampleFilter = (goodValues: unknown[]) => allValues.filter((value) => !goodValues.includes(value));

const goodMessage = 'should return true if the passed value is %p.';
const badMessage = 'should return false if the passed value is %p.';

describe('assert', () => {

  it('should complete if the condition is true', () => expect(() => assert(true)).toBeDefined());

  it('should throw an error if the condition is false', () => expect(() => assert(false)).toThrow('Assertion failed.'));

  it('should throw a specific error if a message is specified', () => expect(() => assert(false, 'msg')).toThrow('msg'));

});

describe.each(allChecks)('%s', (name, check: TypeCheck<any>, goodValues: unknown[]) => {

  it.each(goodValues)(`${goodMessage}`, (value) => expect(check(value)).toBe(true));

  it.each(exampleFilter(goodValues))(`${badMessage}`, (value) => expect(check(value)).toBe(false));

});
