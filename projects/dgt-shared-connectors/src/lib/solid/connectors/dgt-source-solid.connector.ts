import { Observable, of } from 'rxjs';
import { DGTProvider, DGTSourceConnector, DGTExchange, DGTJustification, DGTLDResponse, DGTSource, DGTSourceSolidConfiguration, DGTProviderSolidConfiguration } from '@digita/dgt-shared-data';
import { DGTLDService } from '../../linked-data/services/dgt-ld.service';

export class DGTSourceSolidConnector implements DGTSourceConnector<DGTSourceSolidConfiguration, DGTProviderSolidConfiguration> {
    constructor(private linked: DGTLDService) { }

    connect(justification: DGTJustification, exchange: DGTExchange, source: DGTSource<DGTSourceSolidConfiguration>): Observable<DGTProvider<DGTProviderSolidConfiguration>> {
        return of(null);
    }

    public query(justification: DGTJustification, exchange: DGTExchange, provider: DGTProvider<DGTProviderSolidConfiguration>,source: DGTSource<DGTSourceSolidConfiguration>): Observable<DGTLDResponse> {
        return this.linked.query(exchange.uri, exchange, justification);
    }
}
