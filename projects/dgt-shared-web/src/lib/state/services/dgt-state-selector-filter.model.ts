import { DGTStateSelector } from '../models/dgt-state-selector.model';
import { DGTLDTriple, DGTCategoryFilterService, DGTCategoryFilter } from '@digita/dgt-shared-data/public-api';
import { Observable } from 'rxjs';

export class DGTStateSelectorFilter implements DGTStateSelector<DGTLDTriple[], DGTLDTriple[]> {

    constructor(private filter: DGTCategoryFilterService, private filters: DGTCategoryFilter[]) { }

    execute(input: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        return this.filter.run(this.filters, input);
    }
}