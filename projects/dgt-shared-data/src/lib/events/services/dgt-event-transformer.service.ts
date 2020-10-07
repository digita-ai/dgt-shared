import { Observable, of, forkJoin } from 'rxjs';

import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTEvent } from '../models/dgt-event.model';
import { v4 } from 'uuid';
import { map } from 'rxjs/operators';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';

/** Transforms linked data to events, and the other way around. */
@DGTInjectable()
export class DGTEventTransformerService implements DGTLDTransformer<DGTEvent> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService
    ) { }

    /**
     * Transforms multiple linked data entities to events.
     * @param resources Linked data objects to be transformed to events
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of events
     */
    public toDomain(resources: DGTLDResource[]): Observable<DGTEvent[]> {
        this.paramChecker.checkParametersNotNull({ entities: resources });

        return forkJoin(resources.map(entity => this.toDomainOne(entity)))
            .pipe(
                map(events => _.flatten(events))
            );
    }

    /**
     * Transformed a single linked data entity to events.
     * @param resource The linked data entity to be transformed to events.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of events
     */
    private toDomainOne(resource: DGTLDResource): Observable<DGTEvent[]> {
        this.paramChecker.checkParametersNotNull({ entity: resource });

        let res: DGTEvent[] = null;

        if (resource && resource.triples) {
            const eventSubjectValues = resource.triples.filter(value =>
                value.predicate === 'http://digita.ai/voc/events#event'
            );

            this.logger.debug(DGTEventTransformerService.name, 'Found event subjects to transform', { eventSubjectValues });

            if (eventSubjectValues) {
                res = eventSubjectValues.map(eventSubjectValue => this.transformOne(eventSubjectValue, resource));
            }
        }

        this.logger.debug(DGTEventTransformerService.name, 'Transformed values to events', { entity: resource, res });

        return of(res);
    }

    /**
     * Converts events to linked data.
     * @param events The events which will be transformed to linked data.
     * @param connection The connection on which the events are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data entities.
     */
    public toTriples(events: DGTEvent[], connection: DGTConnectionSolid): Observable<DGTLDResource[]> {
        this.paramChecker.checkParametersNotNull({ events, connection });
        this.logger.debug(DGTEventTransformerService.name, 'Starting to transform to linked data', { events, connection });

        const entities = events.map<DGTLDResource>(event => {
            let triples = event.triples;
            const documentUri = event.documentUri;
            const documentSubject = {
                value: '#',
                termType: DGTLDTermType.REFERENCE
            };
            const eventId = v4();
            const eventSubjectUri = `${documentUri}#${eventId}`;
            const eventSubject = {
                value: eventSubjectUri,
                termType: DGTLDTermType.REFERENCE
            };

            if (!triples) {
                triples = [
                    {
                        exchange: null,
                        source: event.source,
                        connection: event.connection,
                        predicate: 'http://digita.ai/voc/events#description',
                        subject: eventSubject,
                        object: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.STRING,
                            value: event.description
                        },
                        originalValue: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.STRING,
                            value: event.description
                        },
                    },
                    {
                        exchange: null,
                        source: event.source,
                        connection: event.connection,
                        predicate: 'http://digita.ai/voc/events#stakeholder',
                        subject: eventSubject,
                        object: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.STRING,
                            value: event.stakeholder
                        },
                        originalValue: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.STRING,
                            value: event.stakeholder
                        },
                    },
                    {
                        exchange: null,
                        source: event.source,
                        connection: event.connection,
                        predicate: 'http://digita.ai/voc/events#createdAt',
                        subject: eventSubject,
                        object: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.DATETIME,
                            value: event.createdAt.toISOString()
                        },
                        originalValue: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.DATETIME,
                            value: event.createdAt.toISOString()
                        },
                    },
                    {
                        exchange: null,
                        source: event.source,
                        connection: event.connection,
                        predicate: 'http://digita.ai/voc/events#icon',
                        subject: eventSubject,
                        object: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.STRING,
                            value: event.icon
                        },
                        originalValue: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.STRING,
                            value: event.icon
                        },
                    },
                    {
                        exchange: null,
                        source: event.source,
                        connection: event.connection,
                        predicate: 'http://digita.ai/voc/events#uri',
                        subject: eventSubject,
                        object: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.STRING,
                            value: event.stakeholderUri
                        },
                        originalValue: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.STRING,
                            value: event.stakeholderUri
                        },
                    },
                    {
                        exchange: null,
                        source: event.source,
                        connection: event.connection,
                        predicate: 'http://digita.ai/voc/events#event',
                        subject: documentSubject,
                        object: eventSubject,
                        originalValue: eventSubject,
                    }
                ];
            }

            const newEntity: DGTLDResource = {
                ...event,
                documentUri,
                subject: {
                    value: eventSubjectUri,
                    termType: DGTLDTermType.REFERENCE
                },
                triples
            };

            this.logger.debug(DGTEventTransformerService.name, 'Transformed event to linked data', { newEntity, event });

            return newEntity;
        });

        this.logger.debug(DGTEventTransformerService.name, 'Transformed events to linked data', { entities, events });

        return of(entities);
    }

    /**
     * Creates a single event from linked data.
     * @param eventSubjectValue The entity of the the event's subject.
     * @param resource\ The entity to be transformed to an event.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed event.
     */
    private transformOne(eventSubjectValue: DGTLDTriple, resource: DGTLDResource): DGTEvent {
        this.paramChecker.checkParametersNotNull({ eventSubjectValue, entity: resource });
        this.logger.debug(DGTEventTransformerService.name, 'Starting to transform one entity', { eventSubjectValue, entity: resource });

        const documentUri = resource.documentUri ? resource.documentUri : eventSubjectValue.subject.value;

        const description = resource.triples.find(value =>
            value.subject.value === eventSubjectValue.object.value &&
            value.predicate === 'http://digita.ai/voc/events#description'
        );

        const stakeholder = resource.triples.find(value =>
            value.subject.value === eventSubjectValue.object.value &&
            value.predicate === 'http://digita.ai/voc/events#stakeholder'
        );

        const createdAt = resource.triples.find(value =>
            value.subject.value === eventSubjectValue.object.value &&
            value.predicate === 'http://digita.ai/voc/events#createdAt'
        );
        const icon = resource.triples.find(value =>
            value.subject.value === eventSubjectValue.object.value &&
            value.predicate === 'http://digita.ai/voc/events#icon'
        );
        const stakeholderUri = resource.triples.find(value =>
            value.subject.value === eventSubjectValue.object.value &&
            value.predicate === 'http://digita.ai/voc/events#uri'
        );

        const eventTriples = resource.triples.filter(value =>
            value.subject.value === eventSubjectValue.object.value
        );

        return {
            documentUri,
            description: description ? description.object.value : null,
            stakeholder: stakeholder ? stakeholder.object.value : null,
            connection: eventSubjectValue.connection,
            source: eventSubjectValue.source,
            subject: {
                value: eventSubjectValue.object.value,
                termType: DGTLDTermType.REFERENCE
            },
            triples: [...eventTriples, eventSubjectValue],
            createdAt: createdAt ? new Date(createdAt.object.value) : null,
            icon: icon ? icon.object.value : null,
            stakeholderUri: stakeholderUri ? stakeholderUri.object.value : null
        };
    }
}
