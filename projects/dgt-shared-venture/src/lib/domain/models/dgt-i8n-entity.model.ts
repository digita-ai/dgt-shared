import { DGTEntity } from '@digita/dgt-shared-data';
import { DGTI8NLocale, DGTI8NReference } from '@digita/dgt-shared-web';

export interface DGTI8NEntity extends DGTEntity {
    locale: DGTI8NLocale;
    references: Array<DGTI8NReference>;
}
