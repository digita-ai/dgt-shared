import { ActorInitSparql } from '@comunica/actor-init-sparql';
import { newEngine } from '@comunica/actor-init-sparql-rdfjs';
import { IQueryResult } from '@comunica/actor-init-sparql/index-browser';
import { Bindings, IActorQueryOperationOutputBindings } from '@comunica/bus-query-operation';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DataFactory, Literal, Quad, Quad_Object, Quad_Predicate, Quad_Subject, Store, Term } from 'n3';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DGTLDNode } from '../../linked-data/models/dgt-ld-node.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTSparqlOptionsComunica } from '../models/dgt-sparql-options-comunica.model';
import { DGTSparqlResult } from '../models/dgt-sparql-result.model';
import { DGTSparqlService } from './dgt-sparql.service';

/** The DGTSparqlCommunicaService exists to perform Sparql queries on linked data */
@DGTInjectable()
export class DGTSparqlCommunicaService extends DGTSparqlService<DGTSparqlOptionsComunica> {
    private engine: ActorInitSparql;

    constructor(private logger: DGTLoggerService) {
        super();

        this.engine = newEngine();
    }

    /**
     * Runs a Sparql query on a dataset
     * @param dataset The in-memory dataset to query
     * @param query the query to run
     */
    public query(query: string, options: DGTSparqlOptionsComunica): Observable<DGTSparqlResult> {
        this.logger.debug(DGTSparqlCommunicaService.name, 'Starting to run query', { query, options, triples: options.dataset.triples });

        if (!options) {
            throw new DGTErrorArgument('Argument options should be set.', options);
        }

        const store = this.toStore(options.dataset.triples);

        this.logger.debug(DGTSparqlCommunicaService.name, 'Converted triples to n3 store', { store });

        return of({ query, store, options }).pipe(
            switchMap((data) =>
                from(
                    this.engine.query(data.query, {
                        sources: [{ type: 'rdfjsSource', value: data.store }],
                    }),
                ).pipe(map((result) => ({ ...data, result }))),
            ),
            map((data) => ({
                result: data.result.type === 'bindings' ? (data.result as IActorQueryOperationOutputBindings) : null,
            })),
            switchMap((data) => {
                const bindingsList: Bindings[] = [];

                return new Observable<DGTSparqlResult>((observer) => {
                    data.result.bindingsStream.on('end', () => {
                        this.logger.debug(DGTSparqlCommunicaService.name, 'On end');

                        const res: DGTSparqlResult = {
                            head: {
                                vars: data.result.variables.map((variable) => variable.replace('?', '')),
                                link: [],
                            },
                            results: {
                                bindings: this.parseBindings(bindingsList),
                            },
                        };

                        this.logger.debug(DGTSparqlCommunicaService.name, 'Final bindings', bindingsList);

                        observer.next(res);
                        observer.complete();
                    });

                    data.result.bindingsStream.on('data', (bindings: Bindings) => {
                        this.logger.debug(DGTSparqlCommunicaService.name, 'On data', { bindings });

                        bindingsList.push(bindings);
                    });
                });
            }),
            catchError(error => {
                this.logger.error(DGTSparqlCommunicaService.name, 'An error occurred while executing query', error);

                return null;
            }),
        );
    }

    /**
     * Converts Comunica Bindings to an Sparql ResultSet bindings object, so that it
     * follows the w3 spec for select results -> https://www.w3.org/TR/sparql11-results-json/#select-results
     * @param bindingsList List of Bindings to convert
     */
    private parseBindings(bindingsList: Bindings[]): { [key: string]: { type: string; value: string } }[] {
        return bindingsList.map((bindings) => {
            // get keys that are variables aka column headers
            const keys = Array.from(((bindings as any) as Map<string, Term>).keys()).filter((key) =>
                key.startsWith('?'),
            );
            let result = {};
            // for every variable in this binding
            keys.forEach((key) => {
                // get type
                let type = bindings.get(key).termType.toLowerCase();
                // get dataType if literal
                let dataType = undefined;

                if (type === 'literal') {
                    // TODO add support for languages with 'xml:lang' tag (see 3.2.2 Encoding RDF terms)
                    const lang = (bindings.get(key) as Literal).language;
                    // if the datatype is string, it can be ignored
                    // also the datatype/language urls don't work properly
                    if (lang !== 'http://www.w3.org/2001/xmlschema#string') {
                        dataType = lang;
                    }
                    // convert namednode type to uri
                } else if (type === 'namednode') {
                    type = 'uri';
                }
                // TODO add 'blanknode' -> 'bnode' conversion (see 3.2.2 Encoding RDF terms)

                // fill in the new object with new values
                // and remove '?' prefix from the key
                result = {
                    ...result,
                    [key.replace('?', '')]: {
                        type,
                        datatype: dataType,
                        value: bindings.get(key).value,
                    },
                };
            });
            return result;
        });
    }

    /**
     * Converts a list of DGTLDTriples to a Store
     * @param triples List of triples to convert
     */
    private toStore(triples: DGTLDTriple[]): Store<any, any> {
        this.logger.debug(DGTSparqlCommunicaService.name, 'Starting to convert triples to n3 store', { triples });

        if (!triples) {
            throw new DGTErrorArgument('Argument triples should be set.', triples);
        }

        const res = new Store();

        const quads: Quad[] = triples
            .filter((triple) => triple !== null && triple !== undefined)
            .map((triple) => {
                const subject = this.toTerm(triple.subject) as Quad_Subject;
                const predicate = DataFactory.namedNode(triple.predicate) as Quad_Predicate;
                const object = this.toTerm(triple.object) as Quad_Object;

                return DataFactory.quad(subject, predicate, object);
            });

        res.addQuads(quads);

        return res;
    }

    /**
     * Converts a DGTLDNode to a Term
     * @param node Node to convert
     */
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
