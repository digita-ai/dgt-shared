import { DGTProvider } from '../models/dgt-provider.model';
import { Injectable } from '@angular/core';
import { DGTLoggerService, DGTHttpService } from '@digita/dgt-shared-utils';
import { Observable, of, forkJoin } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { DGTProviderSolid } from '../models/dgt-provider-solid.model';
import * as _ from 'lodash';
import { DGTSource } from '../../source/models/dgt-source.model';
import { DGTSourceType } from '../../source/models/dgt-source-type.model';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';

@Injectable()
export class DGTProvidersService {
    constructor(private logger: DGTLoggerService, private http: DGTHttpService) {

    }

    // public connect(provider: DGTProvider<any>, source: DGTSource<any>, callbackUri: string): Observable<DGTProvider<any>> {
    //     this.logger.debug(DGTProvidersService.name, 'Starting to connect to source', { source });

    //     let res: Observable<DGTProvider<any>> = null;

    //     if (source && source.type === DGTSourceType.SOLID) {
    //         res = this.connectToSolid(provider, source, callbackUri);
    //     }

    //     return res;
    // }

    public get(providers: DGTProvider<any>[]): Observable<DGTLDValue[]> {
        this.logger.debug(DGTProvidersService.name, 'Starting to get data from providers', { providers });

        return of(providers)
            .pipe(
                switchMap(() => forkJoin(providers.map(provider => {
                    let res: Observable<DGTLDValue[]> = of([]);

                    if (provider) {
                        // Plus check type

                        res = this.getSolid(provider);
                    }

                    return res;
                }))),
                map(data => _.flatten(data))
            );
    }

    private getSolid(provider: DGTProviderSolid): Observable<DGTLDValue[]> {
        this.logger.debug(DGTProvidersService.name, 'Starting to get data from Solid provider', { provider });

        return this.http.get(provider.configuration.webId, {
            Authorization: 'Bearer ' + provider.configuration.accessToken
        })
            .pipe(
                tap(data => this.logger.debug(DGTProvidersService.name, 'Received ressponse from provider', { data })),
                map(() => [])
            );
    }

}
