import { MemoryTranslator } from '../translators/memory-translator';
import { TranslatorFactory } from '../models/translator-factory';
import { getLoggerFor } from '@digita-ai/handlersjs-logging';

/**
 * Creates {@link Translator } instances for the given language tag.
 */
export class CachedTranslatorFactory implements TranslatorFactory {

  private translations: { [key: string]: string };
  private logger = getLoggerFor(this, 5, 5);

  async createTranslator(language: string): Promise<MemoryTranslator> {

    if (!this.translations) {

      this.logger.info('Fetching translations');
      this.translations = await (await fetch(`${window.location.origin}/${language}.json`)).json();

    }

    return new MemoryTranslator(language, this.translations);

  }

}
