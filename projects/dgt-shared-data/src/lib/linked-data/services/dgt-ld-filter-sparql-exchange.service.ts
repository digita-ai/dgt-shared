import { DGTInjectable, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';

import { DGTLDFilterExchange } from '../models/dgt-ld-filter-exchange.model';
import { DGTLDFilterSparqlService } from './dgt-ld-filter-sparql-service';

/** Service that allow conversion from an exchange filter to a SparQL query */
@DGTInjectable()
export class DGTLDFilterSparqlExchangeService implements DGTLDFilterSparqlService<DGTLDFilterExchange> {

    public readonly type: DGTLDFilterType = DGTLDFilterType.EXCHANGE;

    constructor(private paramChecker: DGTParameterCheckerService) { }

    getQuery(filter: DGTLDFilterExchange): Observable<string> {
        this.paramChecker.checkParametersNotNull({ filter });

        const transformedExchanges = filter.exchanges.map(exchange =>
            `<${exchange.uri}> <http://digita.ai/voc/exchanges#connection> ?subject`,
        );
        const whereExchanges = transformedExchanges.join(' . ');

        // this query returns all user data (from pods) for one or more exchanges
        // looks for triples which subject is the webId of the holder, this webId is gotten
        // from the connection (configuration.webid) which has a direct link to an exchange
        return of(`
        select ?webId ?p ?o
        where {
            ?webId ?p ?o {
                select  distinct ?webId
                where {  ?subject <http://digita.ai/voc/connectionsolidconfig#webid> ?webId {
                    select distinct ?subject
                    where {
                        ${whereExchanges}
                    }
                }}
            }
        }
        `.trim());
    }

}
