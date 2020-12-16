import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DataFactory, Quad } from 'n3';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDTermType } from '../models/dgt-ld-term-type.model';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { DGTLDRepresentationFactory } from './dgt-ld-representation-factory';
import { DGTLDTripleFactoryService } from './dgt-ld-triple-factory.service';

/**
 * Service that converts DGTLDResources to Quads and vice-versa
 */
@DGTInjectable()
export class DGTLDRepresentationN3QuadFactory extends DGTLDRepresentationFactory<Quad[]> {

    constructor(
        private logger: DGTLoggerService,
        private triples: DGTLDTripleFactoryService,
    ) {
        super();
    }

    /**
     * Serializes a list of DGTLDResources to Quads
     * @param resources DGTLDResources to serialize
     * @param transformer The transformer to use
     */
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

    /**
     * Serializes one triple to a Quad
     * @param triple The DGTLDTriple to serialize
     */
    public serializeOne(triple: DGTLDTriple): Quad {
        const subject = DataFactory.namedNode(triple.subject.value);
        const predicate = DataFactory.namedNode(triple.predicate);
        let object = null;

        if (triple.object.termType === DGTLDTermType.LITERAL) {
            // object = DataFactory.literal(triple.object.value, triple.object.dataType);
            object = DataFactory.literal(triple.object.value, DataFactory.namedNode(triple.object.dataType));
        } else {
            object = DataFactory.namedNode(triple.object.value);
        }

        return DataFactory.quad(subject, predicate, object);
    }

    /**
     * Deserializes Quad objects to a typeof DGTLDResource
     * @param quads Quad object to deserialize
     * @param transformer transformer used to convert from Quad objects to R
     */
    public deserialize<R extends DGTLDResource>(quads: Quad[], transformer: DGTLDTransformer<R>): Observable<R[]> {

        if (!quads) {
            throw new DGTErrorArgument('Argument quads should be set.', quads);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        const resources: DGTLDResource[] = [];

        if (quads.length > 0) {
            resources.push({
                uri: null,
                exchange: null,
                triples: this.triples.createFromQuads(quads, quads[0].subject.value),
            } as DGTLDResource);
        }

        this.logger.debug(DGTLDRepresentationN3QuadFactory.name, 'Converted Quads to DGTLDResource', resources);

        return resources.length > 0 ? transformer.toDomain(resources) : of([]);
    }
}
