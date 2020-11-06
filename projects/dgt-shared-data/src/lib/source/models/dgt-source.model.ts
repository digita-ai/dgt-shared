import { DGTSourceType } from './dgt-source-type.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTSourceState } from './dgt-source-state.model';

export interface DGTSource<T> extends DGTLDResource {
    icon: string;
    description: string;
    type: DGTSourceType;
    configuration: T;
    state?: DGTSourceState;
}
