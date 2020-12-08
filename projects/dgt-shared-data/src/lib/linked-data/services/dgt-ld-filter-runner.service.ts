import { Observable } from 'rxjs';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';

export interface DGTLDFilterRunnerService<T extends DGTLDFilter> {
    type: DGTLDFilterType;
    run<R extends DGTLDResource>(filter: T, resources: R[]): Observable<R[]>;
}
