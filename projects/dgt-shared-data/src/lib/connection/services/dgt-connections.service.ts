import { DGTConnection } from '../models/dgt-connection.model';
import { DGTLoggerService, DGTHttpService } from '@digita-ai/dgt-shared-utils';
import { Observable, of, forkJoin } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { DGTConnectionSolid } from '../models/dgt-connection-solid.model';
import * as _ from 'lodash';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Injectable } from '@angular/core';

@Injectable()
export class DGTConnectionsService {
    constructor(private logger: DGTLoggerService, private http: DGTHttpService) {

    }

    // public connect(connection: DGTConnection<any>, source: DGTSource<any>, callbackUri: string): Observable<DGTConnection<any>> {
    //     this.logger.debug(DGTConnectionsService.name, 'Starting to connect to source', { source });

    //     let res: Observable<DGTConnection<any>> = null;

    //     if (source && source.type === DGTSourceType.SOLID) {
    //         res = this.connectToSolid(connection, source, callbackUri);
    //     }

    //     return res;
    // }

    public get(connections: DGTConnection<any>[]): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTConnectionsService.name, 'Starting to get data from connections', { connections });

        return of(connections)
            .pipe(
                switchMap(() => forkJoin(connections.map(connection => {
                    let res: Observable<DGTLDTriple[]> = of([]);

                    if (connection) {
                        // Plus check type

                        res = this.getSolid(connection);
                    }

                    return res;
                }))),
                map(data => _.flatten(data))
            );
    }

    private getSolid(connection: DGTConnectionSolid): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTConnectionsService.name, 'Starting to get data from Solid connection', { connection });

        return this.http.get(connection.configuration.webId, {
            Authorization: 'Bearer ' + connection.configuration.accessToken
        })
            .pipe(
                tap(data => this.logger.debug(DGTConnectionsService.name, 'Received ressponse from connection', { data })),
                map(() => [])
            );
    }

}
