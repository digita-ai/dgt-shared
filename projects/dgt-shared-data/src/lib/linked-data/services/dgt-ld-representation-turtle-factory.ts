import { Observable, of } from 'rxjs';
import { DGTLDRepresentationFactory } from './dgt-ld-representation-factory';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import _ from 'lodash';
import { DGTLDRepresentationN3QuadFactory } from './dgt-ld-representation-n3-quad-factory';
import { last, map, switchMap } from 'rxjs/operators';
import { Parser, Quad, Writer } from 'n3';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';

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
}
