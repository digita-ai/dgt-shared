import { Observable, of } from 'rxjs';
import { DGTInjectable, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDFilterSparqlService } from './dgt-ld-filter-sparql-service';
import { DGTLDFilterPartial } from '../models/dgt-ld-filter-partial.model';

/** Service that allow conversion from an partial filter to a SparQL query */
@DGTInjectable()
export class DGTLDFilterSparqlPartialService implements DGTLDFilterSparqlService<DGTLDFilterPartial> {

    public readonly type: DGTLDFilterType = DGTLDFilterType.PARTIAL;

    constructor(private paramChecker: DGTParameterCheckerService) { }

    getQuery(filter: DGTLDFilterPartial): Observable<string> {
        this.paramChecker.checkParametersNotNull({ filter });

        // converts partial {holder: 'uri/wouter', clientSecret: 'abc'} into e.g.
        // {
        //      ?subject ?p ?o
        //      filter regex(?p, "holder$")
        //      filter regex(?o, "wouter")
        // }
        // union
        // {
        //      ?subject ?p ?o
        //      filter regex(?p, "clientSecret$$")
        //      filter regex(?o, "abc")
        // }
        const whereContent = Object.entries(filter.partial).map(entry =>
            `
            {
                select distinct ?subject
                where {
                    {?subject ?p ?o filter regex(?p, "${entry[0]}")}
                    {?subject ?p ?o filter regex(?o, "${entry[1]}$")}
                }
            }
            `.trim()
        ).join(' ');

        // this query returns all system domain models that have a specific holder attribute
        // retrieves all URIs of these SDMs, then looks for the whole objects
        // we also need the
        // subject:   <http://localhost:3001/sparql/invite>
        // predicate: <http://localhost:3001/sparql/invite>
        // object:    <http://localhost:3001/sparql/invite>
        // triples to convert to objects, hence the union
        return of(`
        select ?subject ?predicate ?object
        where {
            {
                ?subject ?predicate ?object
                ${whereContent}
            }
            union
            {
                ?subject ?predicate ?object
                ${whereContent.split('?subject').join('?object')}
            }
        }
        `.trim());
    }

}
