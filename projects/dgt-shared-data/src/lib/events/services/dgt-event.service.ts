import { DGTEvent } from '../models/dgt-event.model';
import { Observable } from 'rxjs';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';

/** Service for managing events. */
export abstract class DGTEventService {

    /**
     * Get all events from multiple files
     * @param eventFiles List of event file uris
     * @param connection Connection to retrieve the events from
     * @param source Source to retrieve the events from
     * @returns Observable of events
     */
    public abstract getAll(profile: DGTProfile): Observable<DGTEvent[]>;

    /**
     * Registers/adds an event to the SOLID-pod
     * @param event Event to be added to the pod
     * @param connection Connection object to add the event to
     * @param source Source object to add the event to
     * @returns Observable
     */
    public abstract register(profile: DGTProfile, events: DGTEvent[]): Observable<DGTEvent[]>

    /**
     * Removes events from the SOLID-pod
     * @param events List of events to be removed
     * @param connection Connection object to delete the events from
     * @param source Source object to remove the event from
     * @returns Observable list of the removed events
     */
    public abstract remove(events: DGTEvent[]): Observable<DGTEvent[]>
}
