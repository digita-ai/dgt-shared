import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable } from 'rxjs';
import { DGTLDFilter } from '../models/dgt-category-filter.model';
import { DGTCategoryFilterType } from '../models/dgt-category-filter-type.model';

export interface DGTCategoryFilterRunnerService<T extends DGTLDFilter> {
    type: DGTCategoryFilterType;
    run(filter: T, triples: DGTLDTriple[]): Observable<DGTLDTriple[]>;
}