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
 * Gets a translator instance for the given class instance.
 *
 * @param loggable - A class instance or a class string name.
 */
export const getTranslatorFor = (
  loggable: string | { constructor: { name: string } },
  language: string,
): Translator => {

  if (!translatorFactory) {

    throw new Error('No TranslatorFactory was set to create translators.');

  }

  return translatorFactory.createTranslator(typeof loggable === 'string' ? loggable : loggable.constructor.name, language);

};

export const setTranslatorFactory = (newTranslatorFactory: TranslatorFactory): void => {

  translatorFactory = newTranslatorFactory;

};
