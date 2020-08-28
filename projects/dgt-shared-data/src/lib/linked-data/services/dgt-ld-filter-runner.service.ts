import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable } from 'rxjs';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';

export interface DGTLDFilterRunnerService<T extends DGTLDFilter> {
    type: DGTLDFilterType;
    run(filter: T, triples: DGTLDTriple[]): Observable<DGTLDTriple[]>;
}
