import { DGTCategoryFilterRunnerService } from './dgt-category-filter-runner.service';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable, from, of } from 'rxjs';
import { DGTCategoryFilterSparql } from '../models/dgt-category-filter-sparql.model';
import { DGTErrorNotImplemented, DGTErrorArgument, DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTCategoryFilterType } from '../models/dgt-category-filter-type.model';
// import { newEngine } from '@comunica/actor-init-sparql-rdfjs';
// import { IActorQueryOperationOutputBindings, Bindings } from '@comunica/bus-query-operation';
import { Store, N3Store, DataFactory, Quad, Quad_Subject, Quad_Predicate, Quad_Object } from 'n3';
import { map, tap, switchMap } from 'rxjs/operators';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { Injectable } from '@angular/core';
// import { ActorInitSparql } from '@comunica/actor-init-sparql/lib/ActorInitSparql-browser';
import { Term } from 'rdf-js';
import { DGTLDTripleFactoryService } from '../../linked-data/services/dgt-ld-triple-factory.service';
import { DGTLDNode } from '../../linked-data/models/dgt-ld-node.model';

@Injectable()
export class DGTCategoryFilterRunnerSparqlService implements DGTCategoryFilterRunnerService<DGTCategoryFilterSparql> {
    public readonly type: DGTCategoryFilterType = DGTCategoryFilterType.SPARQL;
    // private engine: ActorInitSparql;

    constructor(private logger: DGTLoggerService, private triples: DGTLDTripleFactoryService) {
        //   this.engine = newEngine();
    }

    run(filter: DGTCategoryFilterSparql, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {

        this.logger.debug(DGTCategoryFilterRunnerSparqlService.name, 'Starting to run filter', { filter, triples });

        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!triples) {
            throw new DGTErrorArgument('Argument triples should be set.', triples);
        }


        const store = this.toStore(triples);

        this.logger.debug(DGTCategoryFilterRunnerSparqlService.name, 'Converted triples to n3 store', { store });

        // return this.runSparqlQuery(filter.sparql, store)
        //     .pipe(
        //         map(data => this.triples.createFromQuads(data, null, null, null, null))
        //     );
        const kak: DGTLDTriple[] = []
        return of(kak)
    }

    // public runSparqlQuery(query: string, store: N3Store<any, any>): Observable<Quad[]> {

    //     return from(
    //         this.engine.query(query,
    //             {
    //                 sources: [
    //                     { type: 'rdfjsSource', value: store }
    //                 ]
    //             }
    //         )
    //     )
    //         .pipe(
    //             switchMap((result: IActorQueryOperationOutputBindings) => from(this.engine.resultToString(result)).pipe(map(text => ({ result, text })))),
    //             switchMap(data => {
    //                 this.logger.debug(DGTCategoryFilterRunnerSparqlService.name, 'Finished sparql query', { data, text: data.text.data });

    //                 return new Observable<any>(observer => {
    //                     const res: Quad[] = [];

    //                     data.result.bindingsStream.on('data', (chunk: Bindings) => {
    //                         this.logger.debug(DGTCategoryFilterRunnerSparqlService.name, 'On data', { chunk });
    //                         const subject = chunk.get('?subject') as Quad_Subject;
    //                         const predicate = chunk.get('?predicate') as Quad_Predicate;
    //                         const object = chunk.get('?object') as Quad_Object;

    //                         res.push(
    //                             DataFactory.quad(subject, predicate, object)
    //                         );
    //                     })

    //                     data.result.bindingsStream.on('end', () => {
    //                         this.logger.debug(DGTCategoryFilterRunnerSparqlService.name, 'On end', res);
    //                         observer.next(res);
    //                         observer.complete();
    //                     });
    //                 })
    //             }),
    //         );
    // }

    private toStore(triples: DGTLDTriple[]): N3Store<any, any> {
        this.logger.debug(DGTCategoryFilterRunnerSparqlService.name, 'Starting to convert triples to n3 store', { triples });

        if (!triples) {
            throw new DGTErrorArgument('Argument triples should be set.', triples);
        }

        const res = new Store();

        const quads: Quad[] = triples.map(triple => {
            const subject = this.toTerm(triple.subject) as Quad_Subject;
            const predicate = DataFactory.namedNode(triple.predicate.namespace + triple.predicate.name) as Quad_Predicate;
            const object = this.toTerm(triple.object) as Quad_Object;

            return DataFactory.quad(subject, predicate, object);
        });

        res.addQuads(quads)

        return res;
    }

    private toTerm(node: DGTLDNode): Term {
        let res = null;

        if (node) {
            if (node.termType === DGTLDTermType.LITERAL) {
                res = DataFactory.literal(node.value, node.dataType);
            } else if (node.termType === DGTLDTermType.REFERENCE) {
                res = DataFactory.namedNode(node.value);
            } else {
                res = DataFactory.literal(node.value);
            }
        } else {
            res = DataFactory.blankNode;
        }

        return res;
    }
}