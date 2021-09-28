import { DGTErrorArgument } from '../errors/models/dgt-error-argument.model';
import { fulltextMatch } from './fulltext-match';

describe('fulltextMatch()', () => {

  it('should throw error when no object or term is given', () => {

    expect(() => fulltextMatch(null, 'foo')).toThrow(DGTErrorArgument);
    expect(() => fulltextMatch({ foo: 'bar' }, null)).toThrow(DGTErrorArgument);

  });

  it.each([
    [ { foo: 'bar' }, 'foo', false ],
    [ { foo: 'foo' }, 'foo', true ],
    [ { foo: 'foo', bar: 'bar' }, 'foo', true ],
    [ { foo: 'foobar' }, 'foo', true ],
    [ { foo: 'barfoobar' }, 'foo', true ],
    [ { foo: '' }, 'foo', false ],
    [ { foo: null }, 'foo', false ],
    [ { foo: { foo: 'foo' } }, 'foo', false ],
    [ { }, 'foo', false ],
  ])('should match object', (object, term, result) => {

    expect(fulltextMatch(object, term)).toBe(result);

  });

});
