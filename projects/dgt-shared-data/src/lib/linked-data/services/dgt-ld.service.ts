import { Injectable } from '@angular/core';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';
import { Observable } from 'rxjs';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';


@Injectable()
export class DGTLDService {

    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private paramChecker: DGTParameterCheckerService
    ) {
    }

    public query<T>(filter: DGTLDFilter, transformer: DGTLDTransformer<T>): Observable<DGTLDTriple[]> {
        // this.paramChecker.checkParametersNotNull({ filter, transformer });
        this.logger.debug(DGTLDService.name, 'Querying cache with filter {} and transformer {} ', { filter, transformer });
        return this.cache.query(filter, transformer);
    }
}
