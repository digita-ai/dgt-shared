/* eslint-disable @typescript-eslint/dot-notation */
import { MemoryTranslator } from './translators/memory-translator';
import { MemoryTranslatorFactory } from './factories/memory-translator-factory';
import { getTranslator, getTranslatorFor, setTranslator, setTranslatorFactory } from './main';
import { TranslatorFactory } from './models/translator-factory';

describe('main', () => {

  const translator = new MemoryTranslator('en-GB');
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
      const newTranslator = new MemoryTranslator('en-GB');
      setTranslator(newTranslator);
      const newGet = getTranslator();

      expect(get).toEqual(translator);
      expect(get).not.toEqual(newTranslator);
      expect(newGet).not.toEqual(translator);
      expect(newGet).toEqual(newTranslator);

    });

  });

  describe('getTranslatorFor', () => {

    it('should create a translator with a label when given a string', async () => {

      const testTranslator = await getTranslatorFor('en-GB');

      expect(testTranslator.getLang()).toBe('en-GB');

    });

    it('should create a translator with a label based on constructor name when given an instance of a class', async () => {

      const testTranslator = await getTranslatorFor('en-GB');

      expect(testTranslator.getLang()).toBe('en-GB');

    });

    it('should error when no translatorFactory is set', async () => {

      setTranslatorFactory((undefined as unknown) as TranslatorFactory);

      await expect(getTranslatorFor('en-GB')).rejects.toThrow('No TranslatorFactory was set to create translators.');

    });

  });

  describe('setTranslatorFactory', () => {

    it('should set the translator factory', async () => {

      const testTranslator = await getTranslatorFor('en-GB');

      expect(testTranslator instanceof MemoryTranslator).toBe(true);

      setTranslatorFactory(new MemoryTranslatorFactory());

      const newTranslator = await getTranslatorFor('en-US');

      expect(newTranslator instanceof MemoryTranslator).toBe(true);

    });

  });

});
