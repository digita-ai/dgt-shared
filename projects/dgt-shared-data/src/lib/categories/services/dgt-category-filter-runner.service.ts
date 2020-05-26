import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable } from 'rxjs';
import { DGTCategoryFilter } from '../models/dgt-category-filter.model';
import { DGTCategoryFilterType } from '../models/dgt-category-filter-type.model';

export interface DGTCategoryFilterRunnerService<T extends DGTCategoryFilter> {
    type: DGTCategoryFilterType;
    run(filter: T, triples: DGTLDTriple[]): Observable<DGTLDTriple[]>;
}