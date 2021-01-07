
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { DGTHolder } from '../../holder/models/dgt-holder.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTDataValue } from '../models/data-value.model';
import { DGTDataValueService } from './data-value.service';

@DGTInjectable()
/**
 * The services' duty is to handle DGTDataValue objects.
 * From getting values to updating and processing them.
 */
export abstract class DGTDataValueMockService extends DGTDataValueService {

  constructor(
    protected logger: DGTLoggerService,
    protected paramChecker: DGTParameterCheckerService,
    protected filters: DGTLDFilterService,
  ) {
    super(logger, paramChecker, filters)
  }

  get(purposeuri: string): Observable<DGTDataValue> {
    throw new Error('Method not implemented.');
  }
  query(filter?: DGTLDFilter): Observable<DGTDataValue[]> {
    throw new Error('Method not implemented.');
  }
  save(resource: DGTDataValue[]): Observable<DGTDataValue[]> {
    throw new Error('Method not implemented.');
  }
  delete(resource: DGTDataValue): Observable<DGTDataValue> {
    throw new Error('Method not implemented.');
  }
  getForHolder(holder: DGTHolder): Observable<DGTDataValue[]> {
    throw new Error('Method not implemented.');
  }

}
