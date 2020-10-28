
import { DGTEvent } from '../models/dgt-event.model';
import { forkJoin, Observable, of, zip } from 'rxjs';
import { map, tap, switchMap, mergeMap } from 'rxjs/operators';
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTEventTransformerService } from './dgt-event-transformer.service';
import { DGTEventService } from './dgt-event.service';
import * as _ from 'lodash';
import { DGTConnector } from '../../connector/models/dgt-connector.model';
import { DGTLDTypeRegistrationService } from '../../linked-data/services/dgt-ld-type-registration.service';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTLDTypeRegistration } from '../../linked-data/models/dgt-ld-type-registration.model';
import { DGTSourceSolidConfiguration } from '../../source/models/dgt-source-solid-configuration.model';
import { DGTConnectionSolidConfiguration } from '../../connection/models/dgt-connection-solid-configuration.model';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';

/** Service for managing events in Solid. */
@DGTInjectable()
export class DGTEventSolidService extends DGTEventService {
  constructor(
    private connector: DGTConnector<DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration>,
    private transformer: DGTEventTransformerService,
    private typeRegistrations: DGTLDTypeRegistrationService,
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService,
    private exchanges: DGTExchangeService,
  ) {
    super();
  }

  readonly predicate = 'http://digita.ai/voc/events#event';

  private isCorrectTypeRegistration = (typeRegistration: DGTLDTypeRegistration) => typeRegistration.forClass === 'http://digita.ai/voc/events#event';

  /**
   * Get all events from multiple files.
   * @param eventFiles List of event file uris.
   * @param connection Connection to retrieve the events from.
   * @param source Source to retrieve the events from.
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Observable of events.
   */
  public getAll(profile: DGTProfile): Observable<DGTEvent[]> {
    this.logger.debug(DGTEventService.name, 'Preparing to get all events.', { profile });

    this.paramChecker.checkParametersNotNull({ profile });

    const files = _.uniq(profile.typeRegistrations.filter(this.isCorrectTypeRegistration).map(typeRegistration => typeRegistration.instance));

    return of({ files, profile })
      .pipe(
        switchMap(data => this.exchanges.get(profile.exchange)
          .pipe(map(exchange => ({ ...data, exchange })))),
        tap(data => this.logger.debug(DGTEventService.name, 'Retrieved exchange.', data)),
        switchMap(data => zip(...data.files.map(file => this.connector.query<DGTEvent>(file, data.exchange, this.transformer)))),
          // .pipe(map(events => ({ ...data, events: _.flatten(events) })))),
        tap(data => this.logger.debug(DGTEventService.name, 'Retrieved events.', data)),
        map(data => _.flatten(data))
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
  public register(profile: DGTProfile, resources: DGTEvent[]): Observable<DGTEvent[]> {
    this.logger.debug(DGTEventService.name, 'Preparing to register event.', { profile, resources });

    this.paramChecker.checkParametersNotNull({ resources, profile });

    const files = profile.typeRegistrations.filter(this.isCorrectTypeRegistration).map(typeRegistration => typeRegistration.instance);

    return of({ files, resources, profile })
      .pipe(
        switchMap(data =>
          forkJoin(data.resources.map(resource =>
            of()
              .pipe(
                switchMap(() => this.typeRegistrations.registerForResources(this.predicate, resource, data.profile)),
                map(typeRegistrations => ({ ...resource, uri: typeRegistrations[0].instance }))
              )
          )
          )
            .pipe(map(resources => ({ ...data, resources })))
        ),
        switchMap(data => this.connector.add<DGTEvent>(data.resources, this.transformer)
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
  public remove(events: DGTEvent[]): Observable<DGTEvent[]> {
    this.paramChecker.checkParametersNotNull({ events });
    this.logger.debug(DGTEventService.name, 'Preparing to remove event.', { events });

    return of({ events })
      .pipe(
        switchMap(data => this.connector.delete(data.events, this.transformer)),
        map(data => events)
      );
  }
}
