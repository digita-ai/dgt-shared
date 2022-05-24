import { MemoryTranslator } from '../translators/memory-translator';
import { TranslatorFactory } from '../models/translator-factory';

/**
 * Creates {@link Translator } instances for the given language tag.
 */
export class CachedTranslatorFactory implements TranslatorFactory {

  private translations: { [key: string]: string };

  async createTranslator(language: string): Promise<MemoryTranslator> {

    if (!this.translations) {

      this.translations = await (await fetch(`${window.location.origin}/${language}.json`)).json();

    }

    return new MemoryTranslator(language, this.translations);

  }

}
