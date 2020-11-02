import { Observable, of, forkJoin } from 'rxjs';
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTConsent } from '../models/dgt-consent.model';
import { v4 } from 'uuid';
import { map } from 'rxjs/operators';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';

/** Transforms linked data to consents, and the other way around. */
@DGTInjectable()
export class DGTConsentTransformerService implements DGTLDTransformer<DGTConsent> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService
    ) { }

    /**
     * Transforms multiple linked data entities to consents.
     * @param resources Linked data objects to be transformed to consents
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of consents
     */
    public toDomain(resources: DGTLDResource[]): Observable<DGTConsent[]> {
        this.paramChecker.checkParametersNotNull({ entities: resources });

        return forkJoin(resources.map(entity => this.toDomainOne(entity)))
            .pipe(
                map(consents => _.flatten(consents))
            )
    }

    /**
     * Transformed a single linked data entity to consents.
     * @param resource The linked data entity to be transformed to consents.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of consents
     */
    private toDomainOne(resource: DGTLDResource): Observable<DGTConsent[]> {
        this.paramChecker.checkParametersNotNull({ resource });

        let res: DGTConsent[] = null;

        if (resource && resource.triples) {
            const consentSubjectValues = resource.triples.filter(value => value.predicate === 'http://digita.ai/voc/consents#consent'
            );

            this.logger.debug(DGTConsentTransformerService.name, 'Found subjects to transform', { consentSubjectValues: consentSubjectValues });

            if (consentSubjectValues) {
                res = consentSubjectValues.map(consentSubjectValue => this.transformOne(consentSubjectValue, resource));
            }
        }

        this.logger.debug(DGTConsentTransformerService.name, 'Transformed values to consents', { entity: resource, res });

        return of(res);
    }

    /**
     * Converts consents to linked data.
     * @param consents The consents which will be transformed to linked data.
     * @param connection The connection on which the consents are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data entities.
     */
    public toTriples(consents: DGTConsent[]): Observable<DGTLDResource[]> {
        this.paramChecker.checkParametersNotNull({ consents });
        this.logger.debug(DGTConsentTransformerService.name, 'Starting to transform to linked data', { consents: consents });

        const entities = consents.map<DGTLDResource>(consent => {
            let triples = consent.triples;
            const documentSubject = {
                value: '#',
                termType: DGTLDTermType.REFERENCE
            };
            const consentId = consent.uri ? consent.uri : v4();
            this.logger.debug(DGTConsentTransformerService.name, 'starting to transform to linked data without uri for consent', { consent })
            const consentSubjectUri = `${consent.uri}#${consentId}`;
            const consentSubject = {
                value: consentSubjectUri,
                termType: DGTLDTermType.REFERENCE
            };

            if (!triples) {
                triples = [
                    {
                        predicate: 'http://digita.ai/voc/consents#expirationDate',
                        subject: consentSubject,
                        object: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.DATETIME,
                            value: consent.expirationDate
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/consent#purposeLabel',
                        subject: consentSubject,
                        object: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.STRING,
                            value: consent.purposeLabel
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/consent#controller',
                        subject: consentSubject,
                        object: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.STRING,
                            value: consent.controller
                        },
                    },
                    {
                        predicate: 'http://digita.ai/voc/consents#consent',
                        subject: documentSubject,
                        object: consentSubject,
                    }
                ];
            }

            const newEntity: DGTLDResource = {
                ...consent,
                uri: consent.uri,
                triples
            };

            this.logger.debug(DGTConsentTransformerService.name, 'Transformed consent to linked data', { newEntity, consent: consent });

            return newEntity;
        });

        this.logger.debug(DGTConsentTransformerService.name, 'Transformed consents to linked data', { entities, consents: consents });

        return of(entities);
    }

    /**
     * Creates a single consent from linked data.
     * @param consentSubjectValue The entity of the the consent's subject.
     * @param resource\ The entity to be transformed to an consent.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed consent.
     */
    private transformOne(consentSubjectValue: DGTLDTriple, resource: DGTLDResource): DGTConsent {
        this.paramChecker.checkParametersNotNull({ consentSubjectValue, entity: resource });
        this.logger.debug(DGTConsentTransformerService.name, 'Starting to transform one entity', { consentSubjectValue, entity: resource });

        const uri = resource.uri ? resource.uri : consentSubjectValue.subject.value;

        const expirationDate = resource.triples.find(value =>
            value.subject.value === consentSubjectValue.object.value &&
            value.predicate === 'http://digita.ai/voc/consents#expirationDate'
        );

        const purposeLabel = resource.triples.find(value =>
            value.subject.value === consentSubjectValue.object.value &&
            value.predicate === 'http://digita.ai/voc/consent#purposeLabel'
        );

        const controller = resource.triples.find(value =>
            value.subject.value === consentSubjectValue.object.value &&
            value.predicate === 'http://digita.ai/voc/consent#controller'
        );

        const consentTriples = resource.triples.filter(value =>
            value.subject.value === consentSubjectValue.object.value
        );

        return {
            expirationDate: expirationDate ? expirationDate.object.value : null,
            triples: [...consentTriples, consentSubjectValue],
            uri: v4(),
            purposeLabel: purposeLabel ? purposeLabel.object.value : '',
            controller: controller ? controller.object.value : '',
            exchange: resource.exchange,
        };
    }
}
