import { DGTInvite, DGTInviteService, DGTConfigurationBaseWeb } from '@digita-ai/dgt-shared-data';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DGTHttpService, DGTLoggerService, DGTErrorArgument, DGTConfigurationService } from '@digita-ai/dgt-shared-utils';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class DGTInviteRemoteService extends DGTInviteService {
  constructor(
    private http: DGTHttpService,
    private logger: DGTLoggerService,
    private config: DGTConfigurationService<DGTConfigurationBaseWeb>
  ) {
    super();
  }

  get(uri: string): Observable<DGTInvite> {
    if (!uri) {
      throw new DGTErrorArgument('Argument inviteId should be set.', uri);
    }

    return this.http.get<DGTInvite>(`${this.config.get(c => c.server.uri)}invite/${uri}`).pipe(
      map(res => {
        if (res.status === 200) {
          return res.data;
        } else {
          this.logger.debug(DGTInviteRemoteService.name, 'Response status is ', res.status);
          return null;
        }
      }),
    );
  }
  query(filter: Partial<DGTInvite>): Observable<DGTInvite[]> {
    throw new Error('Method not implemented.');
  }
  save(resource: DGTInvite): Observable<DGTInvite> {
    throw new Error('Method not implemented.');
  }
  delete(resource: DGTInvite): Observable<DGTInvite> {
    throw new Error('Method not implemented.');
  }

  public verify(inviteId: string): Observable<DGTInvite> {
    this.logger.debug(DGTInviteRemoteService.name, 'Starting to verify invite', { inviteId });

    if (!inviteId) {
      throw new DGTErrorArgument('Argument inviteId should be set.', inviteId);
    }

    return this.http.get<DGTInvite>(`${this.config.get(c => c.server.uri)}invite/${inviteId}/verify`).pipe(
      map(res => res.data),
      tap(invite => this.logger.debug(DGTInviteRemoteService.name, 'Verified invite', invite))
    );
  }
}
