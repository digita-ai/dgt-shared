/* eslint-disable @typescript-eslint/dot-notation */
import { MemoryTranslator } from './translators/memory-translator';
import { MemoryTranslatorFactory } from './factories/memory-translator-factory';
import { getTranslator, getTranslatorFor, setTranslator, setTranslatorFactory } from './main';
import { TranslatorFactory } from './models/translator-factory';

describe('main', () => {

  const translator = new MemoryTranslator('test-translator', 'en-GB');
  const translatorFactory = new MemoryTranslatorFactory();

  beforeEach(() => {

    setTranslator(translator);
    setTranslatorFactory(translatorFactory);

  });

  describe('getTranslator', () => {

    it('should return the global translator', () => {

      const get = getTranslator();
      expect(get).toEqual(translator);

    });

  });

  describe('setTranslator', () => {

    it('should set the global translator', () => {

      const get = getTranslator();
      const newTranslator = new MemoryTranslator('test-translator', 'en-GB');
      setTranslator(newTranslator);
      const newGet = getTranslator();
      expect(get).toEqual(translator);
      expect(get).not.toEqual(newTranslator);
      expect(newGet).not.toEqual(translator);
      expect(newGet).toEqual(newTranslator);

    });

  });

  describe('getTranslatorFor', () => {

    it('should create a translator with a label when given a string', () => {

      const testTranslator = getTranslatorFor('test-translator', 'en-GB');

      expect(testTranslator['label']).toEqual('test-translator');
      expect(testTranslator.getLang()).toEqual('en-GB');

    });

    it('should create a translator with a label based on constructor name when given an instance of a class', () => {

      const testClass = { constructor: { name: 'test-constructor-name' } };
      const testTranslator = getTranslatorFor(testClass, 'en-GB');

      expect(testTranslator['label']).toEqual('test-constructor-name');
      expect(testTranslator.getLang()).toEqual('en-GB');

    });

    it('should error when no translatorFactory is set', () => {

      setTranslatorFactory((undefined as unknown) as TranslatorFactory);
      expect(() => getTranslatorFor('test-translator', 'en-GB')).toThrow('No TranslatorFactory was set to create translators.');

    });

  });

  describe('setTranslatorFactory', () => {

    it('should set the translator factory', () => {

      const testTranslator = getTranslatorFor('test-translator', 'en-GB');
      expect(testTranslator instanceof MemoryTranslator).toEqual(true);

      setTranslatorFactory(new MemoryTranslatorFactory());

      const newTranslator = getTranslatorFor('test-translator', 'en-US');
      expect(newTranslator instanceof MemoryTranslator).toEqual(true);

    });

  });

});
