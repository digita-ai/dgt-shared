import { Observable, of } from 'rxjs';
import { DGTLDRepresentationFactory } from './dgt-ld-representation-factory';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import _ from 'lodash';
import { DGTLDRepresentationN3QuadFactory } from './dgt-ld-representation-n3-quad-factory';
import { last, map, switchMap } from 'rxjs/operators';
import { DataFactory, Parser, Quad, Quad_Object, Quad_Predicate, Quad_Subject, Writer } from 'n3';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';
import { DGTSparqlResult } from '../../sparql/models/dgt-sparql-result.model';

@DGTInjectable()
export class DGTLDRepresentationTurtleFactory extends DGTLDRepresentationFactory<string> {

    constructor(
        private logger: DGTLoggerService,
        private toN3Quads: DGTLDRepresentationN3QuadFactory,
    ) {
        super();
    }

    public serialize<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<string> {
        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ resources, writer: new Writer({ format: 'text/turtle' }), transformer })
            .pipe(
                switchMap(data => this.toN3Quads.serialize(data.resources, data.transformer)
                    .pipe(map(quads => ({ ...data, quads })))),
                switchMap(data => new Observable<string>(subscriber => {
                    data.writer.addQuads(data.quads);

                    data.writer.end((error, result) => {
                        this.logger.debug(DGTLDRepresentationTurtleFactory.name, 'Finished serialization', { error, result });

                        if (error) {
                            subscriber.error(error);
                        }

                        subscriber.next(result);
                        subscriber.complete();
                    })
                })),
                last(),
                // map(data => data.writer.quadsToString(data.quads)),
            )
    }

    public deserialize<R extends DGTLDResource>(serialized: string, transformer: DGTLDTransformer<R>): Observable<R[]> {
        if (!serialized) {
            throw new DGTErrorArgument('Argument resources should be set.', serialized);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        this.logger.debug(DGTLDRepresentationTurtleFactory.name, 'Parsing string to Quads', serialized);

        const parsed: Quad[] = new Parser().parse(serialized);

        this.logger.debug(DGTLDRepresentationTurtleFactory.name, 'Parsed string to Quads', parsed);

        return this.toN3Quads.deserialize(parsed, transformer);
    }

    /**
     * Converts a SparQL ResultSet into DGTLDResources
     * The resultSet should have 3 'vars' like Triples: subject, predicate and object
     * @param resultSet The resultSet as application/sparql-results+json
     * @param transformer The transformer to use
     */
    public deserializeResultSet<R extends DGTLDResource>(resultSet: DGTSparqlResult, transformer: DGTLDTransformer<R>): Observable<R[]> {
        if (!resultSet) {
            throw new DGTErrorArgument('Argument resources should be set.', resultSet);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        this.logger.debug(DGTLDRepresentationTurtleFactory.name, 'Parsing resultSet to Quads', resultSet);

        const subjectVar = resultSet.head.vars[0];
        const predicateVar = resultSet.head.vars[1];
        const objectVar = resultSet.head.vars[2];

        const parsed: Quad[] = resultSet.results.bindings.map(binding => {

            const subjectJson = binding[subjectVar];
            const predicateJson = binding[predicateVar];
            const objectJson = binding[objectVar];

            // assuming subjects are always references?
            const subject: Quad_Subject = DataFactory.namedNode(subjectJson.value);
            // predicates are always references
            const predicate: Quad_Predicate = DataFactory.namedNode(predicateJson.value);
            // objects can be references or literals
            const object: Quad_Object = objectJson.type === 'uri' ?
                DataFactory.namedNode(objectJson.value) :
                DataFactory.literal(objectJson.value);

            return DataFactory.quad(subject, predicate, object, DataFactory.defaultGraph());
        });

        this.logger.debug(DGTLDRepresentationTurtleFactory.name, 'Parsed resultSet to Quads', parsed);

        return this.toN3Quads.deserialize(parsed, transformer);

    }
}
