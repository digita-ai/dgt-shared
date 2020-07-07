import { DGTSourceType } from './dgt-source-type.model';
import { DGTEntity } from '../../metadata/models/dgt-entity.model';
import { DGTSourceState } from './dgt-source-state.model';

export interface DGTSource<T> extends DGTEntity {
    icon: string;
    description: string;
    type: DGTSourceType;
    configuration: T;
    state?: DGTSourceState;
}
