import { Injectable } from '@angular/core';
import { DGTEvent } from '../models/dgt-event.model';
import { Observable, of } from 'rxjs';
import { DGTEventService } from './dgt-event.service';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTSourceSolid } from '../../source/models/dgt-source-solid.model';

@Injectable()
export class DGTEventMockService extends DGTEventService {
  events = [null];

  public getAll(profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTEvent[]> {
    return of(this.events);
  }

  public register(profile: DGTProfile, events: DGTEvent[], connection: DGTConnectionSolid): Observable<DGTEvent[]> {
    this.events.push(...events);
    return of(events);
  }

  public remove(events: DGTEvent[], connection: DGTConnectionSolid): Observable<DGTEvent[]> {
    return of(events);
  }
}
