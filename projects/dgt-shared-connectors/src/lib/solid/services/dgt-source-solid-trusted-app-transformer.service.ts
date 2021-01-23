import { DGTConnectionSolid, DGTLDResource, DGTLDTermType, DGTLDTransformer, DGTLDTriple } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DGTSourceSolidTrustedAppMode } from '../models/dgt-source-solid-trusted-app-mode.model';
import { DGTSourceSolidTrustedApp } from '../models/dgt-source-solid-trusted-app.model';

/** Transforms linked data to trustedapps, and the other way around. */
@DGTInjectable()
export class DGTSourceSolidTrustedAppTransformerService implements DGTLDTransformer<DGTSourceSolidTrustedApp> {

    constructor(
        private logger: DGTLoggerService,
    ) { }

    /**
     * Transforms multiple linked data entities to trustedapps.
     * @param entities Linked data objects to be transformed to trustedapps
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of trustedapps
     */
    public toDomain(entities: DGTLDResource[]): Observable<DGTSourceSolidTrustedApp[]> {
        if (!entities) {
            throw new DGTErrorArgument('Argument entities should be set.', entities);
        }

        return forkJoin(entities.map(entity => this.toDomainOne(entity)))
            .pipe(
                map(trustedapps => _.flatten(trustedapps)),
            )
    }

    /**
     * Transformed a single linked data entity to trustedapps.
     * @param entity The linked data entity to be transformed to trustedapps.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of trustedapps
     */
    private toDomainOne(entity: DGTLDResource): Observable<DGTSourceSolidTrustedApp[]> {
        if (!entity) {
            throw new DGTErrorArgument('Argument entity should be set.', entity);
        }

        let res: DGTSourceSolidTrustedApp[] = null;

        if (entity && entity.triples) {
            const trustedAppTriples = entity.triples.filter(value =>
                value.predicate === 'http://www.w3.org/ns/auth/acl#trustedApp',
            );

            this.logger.debug(DGTSourceSolidTrustedAppTransformerService.name, 'Found trusted app triples to transform', { trustedAppTriples });

            if (trustedAppTriples) {
                res = trustedAppTriples.map(trustedappSubjectValue => this.transformOne(trustedappSubjectValue, entity));
            }
        }

        this.logger.debug(DGTSourceSolidTrustedAppTransformerService.name, 'Transformed resources to trusted apps', { entity, res });

        return of(res);
    }

    /**
     * Converts trustedapps to linked data.
     * @param trustedapps The trustedapps which will be transformed to linked data.
     * @param connection The connection on which the trustedapps are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data entities.
     */
    public toTriples(trustedapps: DGTSourceSolidTrustedApp[]): Observable<DGTLDResource[]> {
        throw new Error();
    }

    /**
     * Creates a single trustedapp from linked data.
     * @param trustedAppTriple The entity of the the trustedapp's subject.
     * @param entity The entity to be transformed to an trustedapp.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed trustedapp.
     */
    private transformOne(trustedAppTriple: DGTLDTriple, entity: DGTLDResource): DGTSourceSolidTrustedApp {
        this.logger.debug(DGTSourceSolidTrustedAppTransformerService.name, 'Starting to transform one entity', { trustedAppTriple, entity });

        if (!trustedAppTriple) {
            throw new DGTErrorArgument('Argument trustedAppTriple should be set.', trustedAppTriple);
        }

        if (!entity) {
            throw new DGTErrorArgument('Argument entity should be set.', entity);
        }

        const uri = entity.uri ? entity.uri : trustedAppTriple.subject.value;

        const origin = entity.triples.find(value =>
            value.subject.value === trustedAppTriple.object.value &&
            value.predicate === 'http://www.w3.org/ns/auth/acl#origin',
        );

        const modes = entity.triples.filter(value =>
            value.subject.value === trustedAppTriple.object.value &&
            value.predicate === 'http://www.w3.org/ns/auth/acl#mode',
        );

        const parsedModes: DGTSourceSolidTrustedAppMode[] = modes ? modes.map(mode => {
            return mode.object.value as DGTSourceSolidTrustedAppMode;
        }) : null;

        const triples = entity.triples.filter(value =>
            value.subject.value === trustedAppTriple.object.value,
        );

        return {
            uri,
            triples: [...triples, trustedAppTriple],
            origin: origin ? origin.object.value : null,
            modes: parsedModes,
            exchange: entity.exchange,
        };
    }
}
