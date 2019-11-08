import { Observable } from 'rxjs';
import { DGTSourceConnector, DGTExchange, DGTSource, DGTJustification, DGTLDResponse } from '@digita/dgt-shared-data';
import { DGTLDService } from '../../linked-data/services/dgt-ld.service';

export class DGTSourceSolidConnector implements DGTSourceConnector {
    constructor(private linked: DGTLDService) { }

    public query(
        webId: string,
        exchange: DGTExchange,
        justification: DGTJustification,
        source: DGTSource
    ): Observable<DGTLDResponse> {
        return this.linked.query(webId, exchange, justification, source);
    }
}
