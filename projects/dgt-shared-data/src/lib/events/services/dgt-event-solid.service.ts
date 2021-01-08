
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of, zip } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DGTConnectionSolidConfiguration } from '../../connection/models/dgt-connection-solid-configuration.model';
import { DGTConnector } from '../../connector/models/dgt-connector.model';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTLDTypeRegistration } from '../../linked-data/models/dgt-ld-type-registration.model';
import { DGTSourceSolidConfiguration } from '../../source/models/dgt-source-solid-configuration.model';
import { DGTEvent } from '../models/dgt-event.model';
import { DGTEventTransformerService } from './dgt-event-transformer.service';
import { DGTEventService } from './dgt-event.service';

/** Service for managing events in Solid. */
@DGTInjectable()
export class DGTEventSolidService extends DGTEventService {

  readonly predicate = 'http://digita.ai/voc/events#event';
  constructor(
    private connector: DGTConnector<DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration>,
    private transformer: DGTEventTransformerService,
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService,
  ) {
    super();
  }

  private isCorrectTypeRegistration = (typeRegistration: DGTLDTypeRegistration) => typeRegistration.forClass === 'http://digita.ai/voc/events#event';

  /**
   * Get all events from multiple files.
   * @param eventFiles List of event file uris.
   * @param connection Connection to retrieve the events from.
   * @param source Source to retrieve the events from.
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Observable of events.
   */
  public getAll(exchange: DGTExchange): Observable<DGTEvent[]> {
    this.logger.debug(DGTEventService.name, 'Preparing to get all events.', { exchange });

    this.paramChecker.checkParametersNotNull({ exchange });

    return of({ exchange })
      .pipe(
        switchMap(data => this.connector.query<DGTEvent>(data.exchange, this.transformer)),
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
  public register(resources: DGTEvent[]): Observable<DGTEvent[]> {
    this.logger.debug(DGTEventService.name, 'Preparing to register event.', { resources });

    this.paramChecker.checkParametersNotNull({ resources });

    return of({ resources })
      .pipe(
        switchMap(data => this.connector.save<DGTEvent>(data.resources, this.transformer)
          .pipe(map(addedEvents => ({ ...data, addedEvents })))),
        tap(data => this.logger.debug(DGTEventSolidService.name, 'Added new events', data)),
        map(data => data.addedEvents),
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
        map(data => events),
      );
  }
}
