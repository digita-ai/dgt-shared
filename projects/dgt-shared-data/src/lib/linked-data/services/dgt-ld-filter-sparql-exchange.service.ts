import { DGTConfigurationBaseApi, DGTConfigurationService, DGTInjectable, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';

import { DGTLDFilterExchange } from '../models/dgt-ld-filter-exchange.model';
import { DGTLDFilterSparqlService } from './dgt-ld-filter-sparql-service';

/** Service that allow conversion from an exchange filter to a SparQL query */
@DGTInjectable()
export class DGTLDFilterSparqlExchangeService implements DGTLDFilterSparqlService<DGTLDFilterExchange> {

    public readonly type: DGTLDFilterType = DGTLDFilterType.EXCHANGE;

    constructor(
        private paramChecker: DGTParameterCheckerService,
        private config: DGTConfigurationService<DGTConfigurationBaseApi>,
    ) { }

    getQuery(filter: DGTLDFilterExchange): Observable<string> {
        this.paramChecker.checkParametersNotNull({ filter });

        // this query returns all user data (from pods) for one or more exchanges
        // looks for triples which subject is the webId of the holder, this webId is gotten
        // from the connection (configuration.webid) which has a direct link to an exchange
        return of(`
        SELECT ?s ?p ?o
        ${filter.exchanges.map(e => 'FROM <' + this.config.get(c => c.cache.uri) + 'data/' + encodeURIComponent(e.uri) + '>').join(' ')}
        WHERE {
            ?s ?p ?o
        }
        `.trim());
    }

}
