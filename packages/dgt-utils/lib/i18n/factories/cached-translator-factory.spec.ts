/* eslint-disable @typescript-eslint/dot-notation */
import fetchMock from 'jest-fetch-mock';
import { CachedTranslatorFactory } from './cached-translator-factory';

describe('CachedTranslatorFactory', () => {

  let factory: CachedTranslatorFactory;

  beforeEach(() => {

    factory = new CachedTranslatorFactory();

  });

  it('should create translator with correct language', async () => {

    const translator = await factory.createTranslator('en');

    expect(translator.getLang()).toBe('en');

  });

  it('should set translations when creating translator', async () => {

    expect(factory['translations']).toBeUndefined();

    await factory.createTranslator('en');

    expect(factory['translations']).toBeTruthy();

  });

  it('should only fetch translations once', async () => {

    fetchMock.resetMocks();
    fetchMock.mockIf(/.*\.json$/, '{}');

    expect(factory['translations']).toBeUndefined();

    for (let i = 0; i < 10; i++) {

      await factory.createTranslator('en');

    }

    expect(fetchMock.mock.calls).toHaveLength(1);

  });

});
