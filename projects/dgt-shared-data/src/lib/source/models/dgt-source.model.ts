import { DGTSourceType } from './dgt-source-type.model';
import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTSource<T> extends DGTEntity {
    description: string;
    type: DGTSourceType;
    configuration: T;
}
