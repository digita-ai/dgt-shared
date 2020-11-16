import { Observable, of, forkJoin } from 'rxjs';

import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTSecurityCredential } from '../models/dgt-security-credential.model';

/** Transforms linked data to credentials, and the other way around. */
@DGTInjectable()
export class DGTSecurityCredentialTransformerService implements DGTLDTransformer<DGTSecurityCredential> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService
    ) { }

    /**
     * Transforms multiple linked data entities to credentials.
     * @param resources Linked data objects to be transformed to credentials
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of credentials
     */
    public toDomain<T extends DGTSecurityCredential>(resources: DGTLDResource[]): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ entities: resources });

        return forkJoin(resources.map(entity => this.toDomainOne<T>(entity)))
            .pipe(
                map(credentials => _.flatten(credentials))
            );
    }

    /**
     * Transformed a single linked data entity to credentials.
     * @param resource The linked data entity to be transformed to credentials.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of credentials
     */
    private toDomainOne<T extends DGTSecurityCredential>(resource: DGTLDResource): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ entity: resource });

        let res: DGTSecurityCredential[] = null;

        if (resource && resource.triples) {
            const credentialSubjectValues = resource.triples.filter(value =>
                value.predicate === 'http://digita.ai/voc/security#credential'
            );

            if (credentialSubjectValues) {
                res = credentialSubjectValues.map(credentialSubjectValue => this.transformOne<T>(credentialSubjectValue, resource));
            }
        }

        this.logger.debug(DGTSecurityCredentialTransformerService.name, 'Transformed values to credentials', { entity: resource, res });

        return of(res as T[]);
    }

    /**
     * Converts credentials to linked data.
     * @param credentials The credentials which will be transformed to linked data.
     * @param connection The connection on which the credentials are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data entities.
     */
    public toTriples<T extends DGTSecurityCredential>(credentials: DGTSecurityCredential[]): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ credentials });
        this.logger.debug(DGTSecurityCredentialTransformerService.name, 'Starting to transform to linked data', { credentials });

        const transformedcredentials = credentials.map<DGTSecurityCredential>(credential => {
            const documentSubject = {
                value: '#',
                termType: DGTLDTermType.REFERENCE
            };

            const credentialSubject = {
                value: credential.uri,
                termType: DGTLDTermType.REFERENCE
            };

            const newTriples: DGTLDTriple[] = [
                {
                    predicate: 'http://digita.ai/voc/credentials#holder',
                    subject: credentialSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: credential.holder
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/credentials#clientSecret',
                    subject: credentialSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: credential.clientSecret
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/credentials#credential',
                    subject: documentSubject,
                    object: credentialSubject,
                }
            ];

            return {
                ...credential,
                uri: credential.uri,
                triples: newTriples
            };
        });

        this.logger.debug(DGTSecurityCredentialTransformerService.name, 'Transformed credentials to linked data', transformedcredentials);

        return of(transformedcredentials as T[]);
    }

    /**
     * Creates a single credential from linked data.
     * @param triple The entity of the the credential's subject.
     * @param resource The entity to be transformed to an credential.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed credential.
     */
    private transformOne<T extends DGTSecurityCredential>(triple: DGTLDTriple, resource: DGTLDResource): T {
        this.paramChecker.checkParametersNotNull({ triple, entity: resource });

        const holder = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/credentials#holder'
        );

        const clientSecret = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/credentials#clientSecret'
        );

        return {
            uri: resource.uri,
            holder: holder ? holder.object.value : null,
            clientSecret: clientSecret ? clientSecret.object.value : null,
            triples: [...resource.triples],
        } as T;
    }
}
