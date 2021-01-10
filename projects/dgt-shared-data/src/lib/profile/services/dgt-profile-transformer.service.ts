import { Observable, of } from 'rxjs';

import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTProfile } from '../models/dgt-profile.model';

@DGTInjectable()
/** Transforms profiles to linked data and vice-versa */
export class DGTProfileTransformerService implements DGTLDTransformer<DGTProfile> {
    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService,
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
    public toTriples(profiles: DGTProfile[]): Observable<DGTLDResource[]> {
        this.logger.debug(DGTProfileTransformerService.name, 'Starting to transform to linked data', { events: profiles });
        this.paramChecker.checkParametersNotNull({ profiles });

        const entities = profiles.map<DGTLDResource>(profile => {
            let triples = profile.triples;
            const uri = profile.uri;
            const accountUri = uri.split('/profile/card#me')[0];
            const profileUri = `${accountUri}/profile`;
            const documentSubject = {
                value: '#me',
                termType: DGTLDTermType.REFERENCE,
            };

            triples = [
                {
                    predicate: 'http://www.w3.org/2006/vcard/ns#fn',
                    subject: documentSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: profile.fullName,
                    },
                },
                {
                    predicate: 'http://www.w3.org/2006/vcard/ns#hasPhoto',
                    subject: documentSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: profile.avatar ? `${profileUri}/${profile.avatar}` : null,
                    },
                },
                {
                    predicate: 'http://www.w3.org/ns/solid/terms#publicTypeIndex',
                    subject: documentSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: profile.publicTypeIndex,
                    },
                },
                {
                    predicate: 'http://www.w3.org/ns/solid/terms#privateTypeIndex',
                    subject: documentSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: profile.privateTypeIndex,
                    },
                },
            ];

            const newResource: DGTLDResource = {
                ...profile,
                uri,
                triples: [...triples],
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
        this.logger.debug(DGTProfileTransformerService.name, 'Starting to transform one entity', { resource });
        this.paramChecker.checkParametersNotNull({ entity: resource });
        const uri = resource.uri;
        const accountUri = uri.split('/profile/card#me')[0];
        const profileUri = `${accountUri}/profile`;

        const fullName = resource.triples.find(value =>
            value.subject.value === uri &&
            (value.predicate === 'http://www.w3.org/2006/vcard/ns#fn' || value.predicate === 'http://xmlns.com/foaf/0.1/name'),
        );

        const avatar = resource.triples.find(value =>
            value.subject.value === uri &&
            value.predicate === 'http://www.w3.org/2006/vcard/ns#hasPhoto',
        );

        const publicTypeIndex = resource.triples.find(value =>
            value.subject.value === uri &&
            value.predicate === 'http://www.w3.org/ns/solid/terms#publicTypeIndex',
        );

        const privateTypeIndex = resource.triples.find(value =>
            value.subject.value === uri &&
            value.predicate === 'http://www.w3.org/ns/solid/terms#privateTypeIndex',
        );

        return {
            uri,
            fullName: fullName ? fullName.object.value : null,
            privateTypeIndex: privateTypeIndex ? privateTypeIndex.object.value : null,
            publicTypeIndex: publicTypeIndex ? publicTypeIndex.object.value : null,
            avatar: avatar ? `${profileUri}/${avatar.object.value}` : null,
            triples: resource.triples,
            exchange: resource.exchange,
        };
    }
}
