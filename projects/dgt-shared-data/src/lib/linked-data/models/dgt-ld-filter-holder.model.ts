import { DGTLDFilter } from './dgt-ld-filter.model';
import { DGTHolder } from '@digita/dgt-shared-data';

export interface DGTLDFilterHolder extends DGTLDFilter {
    holders: DGTHolder[];
}