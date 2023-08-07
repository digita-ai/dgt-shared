import { registerTranslateConfig, use, get, Values, ValuesCallback, ITranslateConfig } from '@appnest/lit-translate';
import { TranslationsLoadedEvent, Translator } from '../models/translator';

/**
 * An implementation of a Translator which stores translations in-memory.
 */
export class MemoryTranslator extends Translator {

  /**
   * Translates a key to a specific locale.
   *
   * @param key The key of the translation.
   * @param locale The locale to which the message should be translated. Overrides the default locale.
   * @returns The translated text.
   *
   * @throws { @link Error }
   * This error is thrown when either no locale or key have been given.
   */

  translate(key: string, values?: Values | ValuesCallback, config?: ITranslateConfig): string {

    if (!key) {

      throw new Error('Argument key should be set.');

    }

    return get(key, values, config);

  }

  /**
   * Returns the language currently used by translator
   *
   * @returns The language currently used by translator
   */
  getLang(): string {

    return this.lang;

  }

  /**
   * Updates the translator's language if a relevant translation file exists
   * for this new language. Otherwise, falls back to the previously used language
   *
   * @param lang The new language to use
   */
  async setLang(lang: string, translations?: { [key: string]: string }): Promise<void> {

    if (!translations) {

      this.loaded = false;

      try {

        this.translations = await (await fetch(`${window.location.origin}/${lang}.json`)).json();
        this.lang = lang;

      } catch (e) {

        // eslint-disable-next-line no-console
        console.error('Failed to load translations for language: ' + lang);

      }

    }

    registerTranslateConfig({
      loader: async () => this.translations,
    });

    await use(this.lang);

    this.loaded = true;
    this.dispatchEvent(new TranslationsLoadedEvent());

  }

}
