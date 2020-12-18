import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Generator, Term, Triple, Update, UpdateOperation } from 'sparqljs';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { DGTLDRepresentationFactory } from './dgt-ld-representation-factory';

@DGTInjectable()
export class DGTLDRepresentationSparqlInsertFactory extends DGTLDRepresentationFactory<string> {
    private generator = new Generator();

    constructor(private logger: DGTLoggerService) {
        super();
    }

    public serialize<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<string> {
        this.logger.debug(DGTLDRepresentationSparqlInsertFactory.name, 'Starting to generate SparQL for insert', { resources, transformer });

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ resources, transformer })
            .pipe(
                switchMap(data => forkJoin(data.resources.map(resource => this.serializeOne(resource, data.transformer)))
                    .pipe(map(updates => ({ ...data, updates })))),
                map(data => {

                    const query: Update = {
                        type: 'update',
                        prefixes: {},
                        updates: data.updates,
                    };

                    this.logger.debug(DGTLDRepresentationSparqlInsertFactory.name, 'Created query object.', { query });

                    const body = this.generator.stringify(query);

                    this.logger.debug(DGTLDRepresentationSparqlInsertFactory.name, 'Created query string.', { body, query });

                    return body;
                }),
            )
    }

    private serializeOne<R extends DGTLDResource>(resource: R, transformer: DGTLDTransformer<R>): Observable<UpdateOperation> {
        this.logger.debug(DGTLDRepresentationSparqlInsertFactory.name, 'Starting to generate SparQL for one insert', { resource, transformer });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ resource, transformer })
            .pipe(
                switchMap(data => data.transformer.toTriples([data.resource])
                    .pipe(map(transformed => ({ ...data, transformed, triples: _.flatten(transformed.map(transformedResource => transformedResource.triples)) })))),
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

                    this.logger.debug(DGTLDRepresentationSparqlInsertFactory.name, 'Parsed triples.', { insertTriples: parsedTriples });

                    return {
                        updateType: 'insert',
                        insert: [{ type: 'bgp', triples: parsedTriples }],
                    };
                }),
            )
    }

    public deserialize<R extends DGTLDResource>(text: string, transformer: DGTLDTransformer<R>): Observable<R[]> {
        throw new DGTErrorNotImplemented();
    }
}
