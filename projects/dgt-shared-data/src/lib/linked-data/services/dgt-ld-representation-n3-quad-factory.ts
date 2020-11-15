import { Observable, of } from 'rxjs';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { DGTLDRepresentationFactory } from './dgt-ld-representation-factory';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import _ from 'lodash';
import { Quad, DataFactory } from 'n3';
import { DGTLDTermType } from '../models/dgt-ld-term-type.model';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { map, switchMap } from 'rxjs/operators';

@DGTInjectable()
export class DGTLDRepresentationN3QuadFactory extends DGTLDRepresentationFactory<Quad[]> {

    constructor(private logger: DGTLoggerService) {
        super();
    }

    public serialize<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<Quad[]> {
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
                map(data => data.triples.map(triple => this.serializeOne(triple))),
            );
    }

    public serializeOne(triple: DGTLDTriple): Quad {
        const subject = DataFactory.namedNode(triple.subject.value);
        const predicate = DataFactory.namedNode(triple.predicate);
        let object = null;

        if (triple.object.termType === DGTLDTermType.LITERAL) {
            object = DataFactory.literal(triple.object.value, triple.object.dataType);
        } else {
            object = DataFactory.namedNode(triple.object.value);
        }

        return DataFactory.quad(subject, predicate, object);
    }

    public deserialize<R extends DGTLDResource>(serialized: Quad[], transformer: DGTLDTransformer<R>): Observable<R[]> {
        throw new DGTErrorNotImplemented();
    }
}