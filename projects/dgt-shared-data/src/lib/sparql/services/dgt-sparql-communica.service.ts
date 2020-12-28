
import { ActorInitSparql } from '@comunica/actor-init-sparql';
import { newEngine } from '@comunica/actor-init-sparql-rdfjs';
import { IQueryResult } from '@comunica/actor-init-sparql/index-browser';
import { Bindings, IActorQueryOperationOutputBindings } from '@comunica/bus-query-operation';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { DataFactory, Quad, Quad_Object, Quad_Predicate, Quad_Subject, Store, Term } from 'n3';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTLDNode } from '../../linked-data/models/dgt-ld-node.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTSparqlDatasetMemory } from '../models/dgt-sparql-dataset-memory.model';
import { DGTSparqlResult } from '../models/dgt-sparql-result.model';
import { DGTSparqlService } from './dgt-sparql.service';

@DGTInjectable()
export class DGTSparqlCommunicaService extends DGTSparqlService<DGTSparqlDatasetMemory> {
    private engine: ActorInitSparql;

    constructor(private logger: DGTLoggerService) {
        super();

        this.engine = newEngine();
    }

    public query(dataset: DGTSparqlDatasetMemory, query: string): Observable<DGTSparqlResult> {
        const store = this.toStore(dataset.triples);

        this.logger.debug(DGTSparqlCommunicaService.name, 'Converted triples to n3 store', { store });

        return from(
            this.engine.query(query,
                {
                    sources: [
                        { type: 'rdfjsSource', value: store },
                    ],
                },
            ),
        )
            .pipe(
                map((result: IQueryResult) => ({ result: result.type === 'bindings' ? result as IActorQueryOperationOutputBindings : null })),
                switchMap(data => {
                    const bindingsList: Bindings[] = [];

                    return new Observable<DGTSparqlResult>((observer) => {
                        data.result.bindingsStream.on('end', () => {
                            this.logger.debug(DGTSparqlCommunicaService.name, 'On end');

                            const res: DGTSparqlResult = {
                                head: {
                                    vars: data.result.variables.map(variable => variable.replace('?', '')),
                                    link: [],
                                },
                                results: {
                                    bindings: bindingsList.map(binding => ({
                                        type: binding.get('termType'),
                                        value: binding.get('value'),
                                        datatype: binding.get('datatype').value,
                                    } as any)),
                                },
                            }

                            observer.next(res);
                            observer.complete();
                        });

                        data.result.bindingsStream.on('data', (bindings: Bindings) => {
                            this.logger.debug(DGTSparqlCommunicaService.name, 'On data', { bindings });

                            bindingsList.push(bindings);
                        });
                    })
                }),
            );
    }

    private toStore(triples: DGTLDTriple[]): Store<any, any> {
        this.logger.debug(DGTSparqlCommunicaService.name, 'Starting to convert triples to n3 store', { triples });

        if (!triples) {
            throw new DGTErrorArgument('Argument triples should be set.', triples);
        }

        const res = new Store();

        const quads: Quad[] = triples.map(triple => {
            const subject = this.toTerm(triple.subject) as Quad_Subject;
            const predicate = DataFactory.namedNode(triple.predicate) as Quad_Predicate;
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
