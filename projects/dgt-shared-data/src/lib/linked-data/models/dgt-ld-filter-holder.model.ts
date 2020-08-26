import { DGTLDFilter } from './dgt-ld-filter.model';
import { DGTHolder } from '../../holder/models/dgt-holder.model';

export interface DGTLDFilterHolder extends DGTLDFilter {
    holders: DGTHolder[];
}