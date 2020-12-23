
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTEvent } from '../models/dgt-event.model';
import { DGTEventService } from './dgt-event.service';

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
