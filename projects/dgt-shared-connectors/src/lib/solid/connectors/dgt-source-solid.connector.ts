import { Observable } from 'rxjs';
import { DGTSourceConnector, DGTExchange, DGTJustification, DGTLDResponse } from '@digita/dgt-shared-data';
import { DGTLDService } from '../../linked-data/services/dgt-ld.service';

export class DGTSourceSolidConnector implements DGTSourceConnector {
    constructor(private linked: DGTLDService) { }

    public query(
        exchange: DGTExchange,
        justification: DGTJustification
    ): Observable<DGTLDResponse> {
        return this.linked.query(exchange.uri, exchange, justification);
    }
}
