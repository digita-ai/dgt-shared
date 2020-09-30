import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTProfile } from '../models/dgt-profile.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';

@Injectable()
/** Transforms profiles to linked data and vice-versa */
export class DGTProfileTransformerService implements DGTLDTransformer<DGTProfile> {
    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService
    ) { }

    /**
     * Converts linked data to profiles.
     * @param resources Entities to be transformed to profiles.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of profiles.
     */
    public toDomain(resources: DGTLDResource[]): Observable<DGTProfile[]> {
        this.paramChecker.checkParametersNotNull({ entities: resources });
        this.logger.debug(DGTProfileTransformerService.name, 'Starting to transform entity to domain', { entities: resources });

        let res: DGTProfile[] = null;

        res = resources.map(entity => this.transformOne(entity));

        this.logger.debug(DGTProfileTransformerService.name, 'Transformed values to profiles', { entities: resources, res });
        return of(res);
    }

    /**
     * Converts profiles to linked data.
     * @param profiles The profiles which will be transformed to linked data.
     * @param connection The connection on which the profiles are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data entities.
     */
    public toTriples(profiles: DGTProfile[], connection: DGTConnectionSolid): Observable<DGTLDResource[]> {
        this.logger.debug(DGTProfileTransformerService.name, 'Starting to transform to linked data', { events: profiles, connection });
        this.paramChecker.checkParametersNotNull({ profiles, connection });

        const entities = profiles.map<DGTLDResource>(profile => {
            let triples = profile.triples;
            const documentUri = connection.configuration.webId;
            const accountUri = connection.configuration.webId.split('/profile/card#me')[0];
            const profileUri = `${accountUri}/profile`;
            const documentSubject = {
                value: '#me',
                termType: DGTLDTermType.REFERENCE
            };

            triples = [
                {
                    exchange: null,
                    source: profile.source,
                    connection: profile.connection,
                    predicate: 'http://www.w3.org/2006/vcard/ns#fn',
                    subject: documentSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: profile.fullName
                    },
                    originalValue: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: profile.fullName
                    },
                },
                {
                    exchange: null,
                    source: profile.source,
                    connection: profile.connection,
                    predicate: 'http://www.w3.org/2006/vcard/ns#hasPhoto',
                    subject: documentSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: profile.avatar ? `${profileUri}/${profile.avatar}` : null
                    },
                    originalValue: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: profile.avatar ? `${profileUri}/${profile.avatar}` : null
                    },
                },
                {
                    exchange: null,
                    source: profile.source,
                    connection: profile.connection,
                    predicate: 'http://www.w3.org/ns/solid/terms#publicTypeIndex',
                    subject: documentSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: profile.publicTypeIndex
                    },
                    originalValue: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: profile.publicTypeIndex
                    },
                },
                {
                    exchange: null,
                    source: profile.source,
                    connection: profile.connection,
                    predicate: 'http://www.w3.org/ns/solid/terms#privateTypeIndex',
                    subject: documentSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: profile.privateTypeIndex
                    },
                    originalValue: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: profile.privateTypeIndex
                    },
                },
            ];

            const newResource: DGTLDResource = {
                ...profile,
                documentUri,
                subject: {
                    value: documentUri,
                    termType: DGTLDTermType.REFERENCE
                },
                triples: [...triples]
            };

            this.logger.debug(DGTProfileTransformerService.name, 'Transformed profile to linked data', { newEntity: newResource, event: profile });

            return newResource;
        });

        this.logger.debug(DGTProfileTransformerService.name, 'Transformed profiles to linked data', { entities, events: profiles });

        return of(entities);
    }

    /**
     * Converts linked data to a single profile.
     * @param resource Entity to be transformed to profiles.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The converted profile.
     */
    private transformOne(resource: DGTLDResource): DGTProfile {
        this.logger.debug(DGTProfileTransformerService.name, 'Starting to transform one entity', { entity: resource });
        this.paramChecker.checkParametersNotNull({ entity: resource });

        const documentUri = resource.documentUri;
        const accountUri = documentUri.split('/profile/card#me')[0];
        const profileUri = `${accountUri}/profile`;

        const fullName = resource.triples.find(value =>
            value.subject.value === resource.subject.value &&
            (value.predicate === 'http://www.w3.org/2006/vcard/ns#fn' || value.predicate === 'http://xmlns.com/foaf/0.1/name')
        );

        const avatar = resource.triples.find(value =>
            value.subject.value === resource.subject.value &&
            value.predicate === 'http://www.w3.org/2006/vcard/ns#hasPhoto'
        );

        const publicTypeIndex = resource.triples.find(value =>
            value.subject.value === resource.subject.value &&
            value.predicate === 'http://www.w3.org/ns/solid/terms#publicTypeIndex'
        );

        const privateTypeIndex = resource.triples.find(value =>
            value.subject.value === resource.subject.value &&
            value.predicate === 'http://www.w3.org/ns/solid/terms#privateTypeIndex'
        );

        const calculationFiles = resource.triples.filter(value =>
            value.subject.value === resource.subject.value &&
            value.predicate === 'http://digita.ai/voc/calculations#file'
        );

        return {
            documentUri,
            fullName: fullName ? fullName.object.value : null,
            privateTypeIndex: privateTypeIndex ? privateTypeIndex.object.value : null,
            publicTypeIndex: publicTypeIndex ? publicTypeIndex.object.value : null,
            avatar: avatar ? `${profileUri}/${avatar.object.value}` : null,
            connection: resource.connection,
            source: resource.source,
            subject: resource.subject,
            triples: resource.triples,
            typeRegistrations: []
        };
    }
}
