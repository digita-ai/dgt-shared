import { DGTEntity } from '@digita-ai/dgt-shared-data';
import { DGTI8NLocale } from './dgt-i8n-locale.model';
import { DGTI8NReference } from './dgt-i8n-reference.model';

export interface DGTI8NEntity extends DGTEntity {
    locale: DGTI8NLocale;
    references: Array<DGTI8NReference>;
}
