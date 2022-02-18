import type { Translator } from './translator';

/**
 * Instantiates new translator instances.
 */
export interface TranslatorFactory {
  /**
   * Create a translator instance for the given label.
   *
   * @param label - A label that is used to identify the given translator.
   * @param language - The language tag.
   */
  createTranslator: (language: string) => Translator | Promise<Translator>;
}
