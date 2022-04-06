import { getLoggerFor } from '@digita-ai/handlersjs-logging';
import { MemoryTranslator } from '../translators/memory-translator';
import { TranslatorFactory } from '../models/translator-factory';

/**
 * Creates {@link Translator } instances for the given language tag.
 */
export class MemoryTranslatorFactory implements TranslatorFactory {

  private logger = getLoggerFor(this, 5, 5);

  createTranslator(language: string): MemoryTranslator {

    this.logger.info('Creating translator', language);

    return new MemoryTranslator(language);

  }

}
