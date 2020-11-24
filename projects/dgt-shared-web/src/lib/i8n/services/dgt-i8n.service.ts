import { Injectable, Injector } from '@angular/core';
import * as locale2 from 'locale2';
import * as _ from 'lodash';
import { DGTI8NLocale } from '../models/dgt-i8n-locale.model';
import { TranslateService } from '@ngx-translate/core';
import { DGTInjectable, DGTLoggerService, DGTPlatformService, DGTPlatformType } from '@digita-ai/dgt-shared-utils';

@DGTInjectable()
export class DGTI8NService {

  constructor(
      private platform: DGTPlatformService,
      private injector: Injector,
      private translate: TranslateService,
      private logger: DGTLoggerService
    ) { }

  public getUrlLocale(domainLocaleMapping: any): DGTI8NLocale {
    let res = null;

    const mapping: {
      domain: string;
      locale: string;
    }[] = domainLocaleMapping;

    if (this.platform.type === DGTPlatformType.BROWSER && mapping) {
      const mappingInstance = _.find(mapping, { domain: window.location.hostname });

      if (mappingInstance) {
        res = new DGTI8NLocale(mappingInstance.locale);
      }
    } else if (this.platform.type === DGTPlatformType.SERVER && mapping) {
      const req = this.injector.get('request');

      let domain = req.get('x-forwarded-host');

      if (!domain) {
        domain = req.get('host');
      }

      const mappingInstance = _.find<{
        domain: string;
        locale: string;
      }>(mapping, { domain });

      if (mappingInstance) {
        res = new DGTI8NLocale(mappingInstance.locale);
      }

    }

    return res;
  }

  public getBrowserLocale(domainLocaleMapping: any): DGTI8NLocale {
    let res = new DGTI8NLocale(locale2);

    if (!_.find(domainLocaleMapping, (o) => {
      return (o.language === res.language && o.country === res.country);
    })) {
      res = null;
    }

    return res;
  }

  public get getUserLocale(): DGTI8NLocale {
    return null;
  }

  public getLocale(defaultLocale: DGTI8NLocale, domainLocaleMapping: any): DGTI8NLocale {
    this.logger.debug(DGTI8NService.name, 'Starting to get default locale', { defaultLocale, domainLocaleMapping });

    let res = defaultLocale;

    const urlLocale = this.getUrlLocale(domainLocaleMapping);
    if (urlLocale) {
      res = urlLocale;
    }

    // if (this.browserLocale) {
    //   res = this.browserLocale;
    // }

    // if (this.userLocale) {
    //   res = this.userLocale;
    // }

    return res;
  }

  public applyDefaultLocale(locale: DGTI8NLocale) {
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translate.setDefaultLang(locale.toString());
  }

  public applyLocale(locale: DGTI8NLocale) {
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use(locale.toString());
  }

}
