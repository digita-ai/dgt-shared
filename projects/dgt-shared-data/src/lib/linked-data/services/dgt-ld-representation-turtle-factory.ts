import { Observable, of } from 'rxjs';
import { DGTLDRepresentationFactory } from './dgt-ld-representation-factory';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import _ from 'lodash';
import { DGTLDRepresentationN3QuadFactory } from './dgt-ld-representation-n3-quad-factory';
import { map, switchMap, tap } from 'rxjs/operators';
import { Writer } from 'n3';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';

@DGTInjectable()
export class DGTLDRepresentationTurtleFactory extends DGTLDRepresentationFactory<string> {

    constructor(private logger: DGTLoggerService, private toN3Quads: DGTLDRepresentationN3QuadFactory) {
        super();
    }

    public serialize<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<string> {
        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ resources, writer: new Writer(), transformer })
            .pipe(
                switchMap(data => this.toN3Quads.serialize(data.resources, data.transformer)
                    .pipe(map(quads => ({ ...data, quads })))),
                map(data => data.writer.quadsToString(data.quads)),
            )
    }

    public deserialize<R extends DGTLDResource>(serialized: string, transformer: DGTLDTransformer<R>): Observable<R[]> {
        throw new DGTErrorNotImplemented();
    }
}