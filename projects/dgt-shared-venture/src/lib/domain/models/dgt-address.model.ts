import { DGTEntity } from '@digita-ai/dgt-shared-data';
import * as _ from 'lodash';

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
