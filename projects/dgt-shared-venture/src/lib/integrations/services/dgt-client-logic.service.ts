import { Injectable } from '@angular/core';
import { AngularFireFunctions } from 'angularfire2/functions';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DGTLogicService } from '@digita/dgt-shared-data';
import { DGTLoggerService } from '@digita/dgt-shared-utils';

@Injectable()
export class DGTClientLogicService implements DGTLogicService {

    constructor(private fns: AngularFireFunctions, private logger: DGTLoggerService) { }

    public execute<T, S>(name: string, data: T): Observable<S> {
        this.logger.debug(DGTClientLogicService.name, 'Executing function', { name, data });

        return this.fns.httpsCallable<T, S>(name)(data)
            .pipe(
                tap(result => this.logger.debug(DGTClientLogicService.name, 'Function executed', { result, name, data })),
            );
    }
}
