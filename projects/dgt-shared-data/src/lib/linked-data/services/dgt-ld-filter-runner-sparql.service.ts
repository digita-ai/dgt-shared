import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable } from 'rxjs';
import { DGTLDFilterSparql } from '../models/dgt-ld-filter-sparql.model';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DataFactory, Quad, Quad_Subject, Quad_Predicate, Quad_Object } from 'n3';

import { DGTLDTripleFactoryService } from '../../linked-data/services/dgt-ld-triple-factory.service';
import { switchMap, map } from 'rxjs/operators';
import { DGTSparqlCommunicaService } from '../../sparql/services/dgt-sparql-communica.service';
import { DGTSparqlDatasetType } from '../../sparql/models/dgt-sparql-dataset-type.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';

@DGTInjectable()
export class DGTLDFilterRunnerSparqlService implements DGTLDFilterRunnerService<DGTLDFilterSparql> {
    public readonly type: DGTLDFilterType = DGTLDFilterType.SPARQL;

    constructor(private logger: DGTLoggerService, private triples: DGTLDTripleFactoryService, private sparql: DGTSparqlCommunicaService) { }

    run(filter: DGTLDFilterSparql, resources: DGTLDResource[]): Observable<DGTLDResource[]> {
        this.logger.debug(DGTLDFilterRunnerSparqlService.name, 'Starting to run filter', { filter, resources });

        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!resources) {
            throw new DGTErrorArgument('Argument triples should be set.', resources);
        }

        throw new DGTErrorNotImplemented();

        // return this.sparql.query({ resources, type: DGTSparqlDatasetType.MEMORY }, filter.sparql)
        //     .pipe(
        //         switchMap(data => {
        //             this.logger.debug(DGTLDFilterRunnerSparqlService.name, 'Finished sparql query', { data });

        //             return new Observable<any>(observer => {
        //                 const res: Quad[] = [];

        //                 // (data.result as any).bindingsStream.on('data', (chunk: Bindings) => {
        //                 //     this.logger.debug(DGTLDFilterRunnerSparqlService.name, 'On data', { chunk });
        //                 //     const subject = chunk.get('?subject') as Quad_Subject;
        //                 //     const predicate = chunk.get('?predicate') as Quad_Predicate;
        //                 //     const object = chunk.get('?object') as Quad_Object;

        //                 //     res.push(
        //                 //         DataFactory.quad(subject, predicate, object)
        //                 //     );
        //                 // })

        //                 // (data.result as any).bindingsStream.on('end', () => {
        //                 //     this.logger.debug(DGTLDFilterRunnerSparqlService.name, 'On end', res);
        //                 //     observer.next(res);
        //                 //     observer.complete();
        //                 // });
        //             })
        //         }),
        //         map(data => this.triples.createFromQuads(data, null, null, null, null))
        //     );
    }
}