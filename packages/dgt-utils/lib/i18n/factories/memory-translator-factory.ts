import { MemoryTranslator } from '../translators/memory-translator';
import { TranslatorFactory } from '../models/translator-factory';

/**
 * Creates {@link Translator } instances for the given language tag.
 */
export class MemoryTranslatorFactory implements TranslatorFactory {

  createTranslator(language: string): MemoryTranslator {

    return new MemoryTranslator(language);

  }

}
