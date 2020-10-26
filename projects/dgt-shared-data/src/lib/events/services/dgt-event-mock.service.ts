
import { DGTEvent } from '../models/dgt-event.model';
import { Observable, of } from 'rxjs';
import { DGTEventService } from './dgt-event.service';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';

@DGTInjectable()
export class DGTEventMockService extends DGTEventService {
  events = [null];

  public getAll(profile: DGTProfile): Observable<DGTEvent[]> {
    return of(this.events);
  }

  public register(profile: DGTProfile, events: DGTEvent[]): Observable<DGTEvent[]> {
    this.events.push(...events);
    return of(events);
  }

  public remove(events: DGTEvent[]): Observable<DGTEvent[]> {
    return of(events);
  }
}
