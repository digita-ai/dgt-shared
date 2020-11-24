import { DGTStateSelector } from '../models/dgt-state-selector.model';
import { DGTLDTriple, DGTLDFilterService, DGTLDFilter } from '@digita-ai/dgt-shared-data';
import { Observable } from 'rxjs';

export class DGTStateSelectorFilter implements DGTStateSelector<DGTLDTriple[], DGTLDTriple[]> {

    constructor(private filter: DGTLDFilterService, private filters: DGTLDFilter[]) { }

    execute(input: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        return this.filter.run(this.filters, input);
    }
}
