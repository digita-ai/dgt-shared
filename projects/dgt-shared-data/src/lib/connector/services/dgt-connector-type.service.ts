import * as _ from 'lodash';
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTConnectorType } from '../models/dgt-connector-type.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';

@DGTInjectable()
export abstract class DGTConnectorTypeService implements DGTLDResourceService<DGTConnectorType> {
    public abstract get(id: string): Observable<DGTConnectorType>;
    public abstract query(filter?: DGTLDFilter): Observable<DGTConnectorType[]>;
    public abstract save<T extends DGTConnectorType>(resources: T[]): Observable<T[]>;
    public abstract delete(resource: DGTConnectorType): Observable<DGTConnectorType>;
}