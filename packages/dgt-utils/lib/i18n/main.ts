import { Translator } from './models/translator';
import { TranslatorFactory } from './models/translator-factory';

let translator: Translator;
let translatorFactory: TranslatorFactory;

/**
 * returns the global translator.
 *
 * @returns { Translator }
 */
export const getTranslator = (): Translator => translator;

/**
 * Sets the global translator.
 * This will cause the translator returned by {@link getTranslator} to be changed.
 *
 * @param { Translator } translator - The (new) translator to set globally.
 */
export const setTranslator = (newTranslator: Translator): void => {

  translator = newTranslator;

};

/**
 * Gets a translator instance for the given language
 *
 * @param language - The given language to use.
 */
export const getTranslatorFor = async (
  language: string,
): Promise<Translator> => {

  if (!translatorFactory) {

    throw new Error('No TranslatorFactory was set to create translators.');

  }

  return await translatorFactory.createTranslator(language);

};

export const setTranslatorFactory = (newTranslatorFactory: TranslatorFactory): void => {

  translatorFactory = newTranslatorFactory;

};
