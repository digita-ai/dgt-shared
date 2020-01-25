import { Observable } from 'rxjs';
import { DGTSourceConnector, DGTExchange, DGTJustification, DGTLDResponse, DGTSource } from '@digita/dgt-shared-data';
import { DGTLDService } from '../../linked-data/services/dgt-ld.service';
import { DGTSourceSolidConfiguration } from '../models/dgt-source-solid-configuration.model';

export class DGTSourceSolidConnector implements DGTSourceConnector<DGTSourceSolidConfiguration> {
    constructor(private linked: DGTLDService) { }

    public query(
        exchange: DGTExchange,
        justification: DGTJustification,
        source: DGTSource<DGTSourceSolidConfiguration>
    ): Observable<DGTLDResponse> {
        return this.linked.query(exchange.uri, exchange, justification);
    }
}
