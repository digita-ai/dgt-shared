import { Injectable } from '@angular/core';
import { DGTEvent } from '../models/dgt-event.model';
import { Observable, of, forkJoin } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { DGTEventTransformerService } from './dgt-event-transformer.service';
import { DGTEventService } from './dgt-event.service';
import * as _ from 'lodash';
import { DGTSourceConnector } from '../../source/models/dgt-source-connector.model';
import { DGTLDTypeRegistrationService } from '../../linked-data/services/dgt-ld-type-registration.service';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTSourceSolid } from '../../source/models/dgt-source-solid.model';

/** Service for managing events in Solid. */
@Injectable()
export class DGTEventSolidService extends DGTEventService {
  constructor(
    private connector: DGTSourceConnector<any, any>,
    private transformer: DGTEventTransformerService,
    private typeRegistrations: DGTLDTypeRegistrationService,
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService
  ) {
    super();
  }

  readonly predicate = 'http://digita.ai/voc/events#event';

  private isCorrectTypeRegistration = (typeRegistration) => typeRegistration.forClass.name === 'event' && typeRegistration.forClass.namespace === 'http://digita.ai/voc/events#';

  /**
   * Get all events from multiple files.
   * @param eventFiles List of event file uris.
   * @param connection Connection to retrieve the events from.
   * @param source Source to retrieve the events from.
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Observable of events.
   */
  public getAll(profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTEvent[]> {
    this.paramChecker.checkParametersNotNull({ profile, connection, source });

    const files = profile.typeRegistrations.filter(this.isCorrectTypeRegistration).map(typeRegistration => typeRegistration.instance);

    return of({ files, profile, connection, source })
      .pipe(
        switchMap(data => forkJoin(files.map(file => this.connector.query<DGTEvent>(file, null, null, connection, source, this.transformer)))
          .pipe(map(events => ({ ...data, events: _.flatten(events) })))),
        map(data => data.events)
      );
  }

  /**
   * Registers/adds an event to the SOLID-pod
   * @param profile Profile to add reference to.
   * @param event Event to be added to the pod.
   * @param connection Connection object to add the event to.
   * @param source Source object to add the event to.
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Observable of registered event.
   */
  public register(profile: DGTProfile, resources: DGTEvent[], connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTEvent[]> {
    this.paramChecker.checkParametersNotNull({ resources, connection, source, profile });
    this.logger.debug(DGTEventService.name, 'Preparing to register event.', { resources });

    const files = profile.typeRegistrations.filter(this.isCorrectTypeRegistration).map(typeRegistration => typeRegistration.instance);

    return of({ files, resources, connection, source, profile })
      .pipe(
        switchMap(data =>
          forkJoin(data.resources.map(resource => this.typeRegistrations.registerForResources(this.predicate, resource, data.profile, data.connection, data.source)
            .pipe(map(typeRegistrations => ({ ...resource, documentUri: typeRegistrations[0].instance }))))
          )
            .pipe(map(resources => ({ ...data, resources })))
        ),
        switchMap(data => this.connector.add<DGTEvent>(data.resources, data.connection, data.source, this.transformer)
          .pipe(map(addedEvents => ({ ...data, addedEvents, })))),
        tap(data => this.logger.debug(DGTEventSolidService.name, 'Added new events', data)),
        map(data => data.addedEvents)
      );
  }

  /**
   * Removes events from the SOLID-pod
   * @param events List of events to be removed
   * @param connection Connection object to delete the events from
   * @param source Source object to remove the event from
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Observable list of the removed events
   */
  public remove(events: DGTEvent[], connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTEvent[]> {
    this.paramChecker.checkParametersNotNull({ events, connection, source });
    this.logger.debug(DGTEventService.name, 'Preparing to remove event.', { events, connection });

    return of({ events, connection, source })
      .pipe(
        switchMap(data => this.connector.delete(data.events, data.connection, data.source, this.transformer)),
        map(data => events)
      );
  }
}
