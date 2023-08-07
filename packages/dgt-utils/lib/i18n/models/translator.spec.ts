/* eslint-disable @typescript-eslint/dot-notation */
import { MemoryTranslator } from '../translators/memory-translator';
import { TRANSLATIONS_LOADED } from './translator';

describe('Translator', () => {

  let service: MemoryTranslator;

  beforeEach(async () => {

    service = new MemoryTranslator('en-GB');

  });

  it('should create', () => {

    expect(service).toBeTruthy();

  });

  describe('addEventListener', () => {

    it('should dispatch event when loaded is true', async () => {

      const prom = new Promise<void>((resolve) => {

        service.addEventListener(TRANSLATIONS_LOADED, () => resolve());

      });

      await expect(prom).resolves.toBeUndefined();

    });

    it('should not dispatch event when loaded is false', () => {

      const spy = jest.spyOn(service, 'dispatchEvent');
      service['loaded'] = false;
      service.dispatchEvent = jest.fn();
      service.addEventListener(TRANSLATIONS_LOADED, () => undefined);

      expect(spy).not.toHaveBeenCalled();

    });

  });

});
