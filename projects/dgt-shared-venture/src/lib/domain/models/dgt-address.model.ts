import * as _ from 'lodash';
import { DGTEntity } from '@digita-ai/dgt-shared-data';

export interface DGTAddress extends DGTEntity {
    country: string,
    state: string,
    county: string,
    city: string,
    district: string,
    postalCode: string,
    street: string,
    houseNumber: string,
    poBox: string,
    label: string,
    validated: boolean
}
