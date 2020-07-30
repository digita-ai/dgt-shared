import { DGTLDTriple, DGTLDTermType, DGTLDTransformer, DGTLDEntity, DGTConnectionSolid } from '@digita/dgt-shared-data';
import { Observable, of, forkJoin } from 'rxjs';
import { Injectable } from '@angular/core';
import { DGTLoggerService, DGTErrorArgument } from '@digita/dgt-shared-utils';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DGTSourceSolidTrustedApp } from '../models/dgt-source-solid-trusted-app.model';
import { DGTSourceSolidTrustedAppMode } from '../models/dgt-source-solid-trusted-app-mode.model';

/** Transforms linked data to trustedapps, and the other way around. */
@Injectable()
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
    public toDomain(entities: DGTLDEntity[]): Observable<DGTSourceSolidTrustedApp[]> {
        if (!entities) {
            throw new DGTErrorArgument('Argument entities should be set.', entities);
        }

        return forkJoin(entities.map(entity => this.toDomainOne(entity)))
            .pipe(
                map(trustedapps => _.flatten(trustedapps))
            )
    }

    /**
     * Transformed a single linked data entity to trustedapps.
     * @param entity The linked data entity to be transformed to trustedapps.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of trustedapps
     */
    private toDomainOne(entity: DGTLDEntity): Observable<DGTSourceSolidTrustedApp[]> {
        if (!entity) {
            throw new DGTErrorArgument('Argument entity should be set.', entity);
        }

        let res: DGTSourceSolidTrustedApp[] = null;

        if (entity && entity.triples) {
            const trustedAppTriples = entity.triples.filter(value =>
                value.predicate.namespace === 'http://www.w3.org/ns/auth/acl#' &&
                value.predicate.name === 'trustedApp'
            );

            this.logger.debug(DGTSourceSolidTrustedAppTransformerService.name, 'Found trusted app triples to transform', { trustedAppTriples });

            if (trustedAppTriples) {
                res = trustedAppTriples.map(trustedappSubjectValue => this.transformOne(trustedappSubjectValue, entity));
            }
        }

        this.logger.debug(DGTSourceSolidTrustedAppTransformerService.name, 'Transformed values to trusted apps', { entity, res });

        return of(res);
    }

    /**
     * Converts trustedapps to linked data.
     * @param trustedapps The trustedapps which will be transformed to linked data.
     * @param connection The connection on which the trustedapps are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data entities.
     */
    public toTriples(trustedapps: DGTSourceSolidTrustedApp[], connection: DGTConnectionSolid): Observable<DGTLDEntity[]> {
        throw new Error();
    }

    /**
     * Creates a single trustedapp from linked data.
     * @param trustedAppTriple The entity of the the trustedapp's subject.
     * @param entity The entity to be transformed to an trustedapp.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed trustedapp.
     */
    private transformOne(trustedAppTriple: DGTLDTriple, entity: DGTLDEntity): DGTSourceSolidTrustedApp {
        this.logger.debug(DGTSourceSolidTrustedAppTransformerService.name, 'Starting to transform one entity', { trustedAppTriple, entity });

        if (!trustedAppTriple) {
            throw new DGTErrorArgument('Argument trustedAppTriple should be set.', trustedAppTriple);
        }

        if (!entity) {
            throw new DGTErrorArgument('Argument entity should be set.', entity);
        }

        const documentUri = entity.documentUri ? entity.documentUri : trustedAppTriple.subject.value;

        const origin = entity.triples.find(value =>
            value.subject.value === trustedAppTriple.object.value &&
            value.predicate.namespace === 'http://www.w3.org/ns/auth/acl#' &&
            value.predicate.name === 'origin'
        );

        const modes = entity.triples.filter(value =>
            value.subject.value === trustedAppTriple.object.value &&
            value.predicate.namespace === 'http://www.w3.org/ns/auth/acl#' &&
            value.predicate.name === 'mode'
        );

        const parsedModes: DGTSourceSolidTrustedAppMode[] = modes ? modes.map(mode => {
            return mode.object.value as DGTSourceSolidTrustedAppMode;
        }) : null;

        const triples = entity.triples.filter(value =>
            value.subject.value === trustedAppTriple.object.value
        );

        return {
            documentUri,
            connection: trustedAppTriple.connection,
            source: trustedAppTriple.source,
            subject: {
                value: trustedAppTriple.object.value,
                termType: DGTLDTermType.REFERENCE
            },
            triples: [...triples, trustedAppTriple],
            origin: origin ? origin.object.value : null,
            modes: parsedModes
        };
    }
}
