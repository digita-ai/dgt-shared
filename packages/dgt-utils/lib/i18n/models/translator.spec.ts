/* eslint-disable @typescript-eslint/dot-notation */
import { MemoryTranslator } from '../translators/memory-translator';
import { TRANSLATIONS_LOADED } from './translator';

describe('Translator', () => {

  let service: MemoryTranslator;

  beforeEach(async () => {

    service = new MemoryTranslator('label', 'en-GB');

  });

  it('should create', () => {

    expect(service).toBeTruthy();

  });

  describe('addEventListener', () => {

    it('should dispatch event when loaded is true', (done) => {

      service.addEventListener(TRANSLATIONS_LOADED, () => done());

    });

    it('should not dispatch event when loaded is false', () => {

      service['loaded'] = false;
      service.dispatchEvent = jest.fn();
      service.addEventListener(TRANSLATIONS_LOADED, () => undefined);
      expect(service.dispatchEvent).not.toHaveBeenCalled();

    });

  });

});
