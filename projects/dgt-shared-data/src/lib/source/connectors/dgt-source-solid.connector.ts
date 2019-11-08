import { DGTSourceConnector } from '../models/dgt-source-connector.model';
import { DGTLDResponse } from '../../linked-data/models/dgt-ld-response.model';
import { DGTJustification } from '../../justification/models/dgt-justification.model';
import { DGTExchange } from '../../subject/models/dgt-subject-exchange.model';
import { Observable } from 'rxjs';
import { DGTSource } from '../models/dgt-source.model';
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
