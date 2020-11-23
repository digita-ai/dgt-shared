import { Observable, of } from 'rxjs';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { DGTLDRepresentationFactory } from './dgt-ld-representation-factory';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import _ from 'lodash';
import { Generator, Update, Triple, Term } from 'sparqljs';
import { DGTLDTermType } from '../models/dgt-ld-term-type.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';
import { map, switchMap } from 'rxjs/operators';

@DGTInjectable()
export class DGTLDRepresentationSparqlDeleteFactory extends DGTLDRepresentationFactory<string> {
    private generator = new Generator();

    constructor(private logger: DGTLoggerService) {
        super();
    }

    public serialize<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<string> {
        this.logger.debug(DGTLDRepresentationSparqlDeleteFactory.name, 'Starting to generate SparQL for delete', { resources, transformer });

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ resources, transformer })
            .pipe(
                switchMap(data => data.transformer.toTriples(data.resources)
                    .pipe(map(transformed => ({ ...data, transformed, triples: _.flatten(transformed.map(resource => resource.triples)) })))),
                map(data => {
                    const parsedTriples: Triple[] = data.triples.map((triple: DGTLDTriple) => {
                        let object: Term = `${triple.object.value}` as Term;

                        if (triple.object.termType === DGTLDTermType.LITERAL) {
                            object = `\"${triple.object.value}\"^^${triple.object.dataType}` as Term;
                        }

                        return {
                            subject: triple.subject.value as Term,
                            predicate: triple.predicate as Term,
                            object,
                        };
                    });

                    this.logger.debug(DGTLDRepresentationSparqlDeleteFactory.name, 'Parsed triples.', { insertTriples: parsedTriples, });

                    let query: Update = {
                        type: 'update',
                        prefixes: {},
                        updates: [
                            {
                                updateType: 'delete',
                                delete: [{ type: 'bgp', triples: parsedTriples }],
                            },
                        ],
                    };

                    this.logger.debug(DGTLDRepresentationSparqlDeleteFactory.name, 'Created query object.', { query, insertTriples: parsedTriples, });

                    const body = this.generator.stringify(query);

                    this.logger.debug(DGTLDRepresentationSparqlDeleteFactory.name, 'Created query string.', { body, query, });

                    return body;
                })
            )
    }

    public deserialize<R extends DGTLDResource>(text: string, transformer: DGTLDTransformer<R>): Observable<R[]> {
        throw new DGTErrorNotImplemented();
    }
}