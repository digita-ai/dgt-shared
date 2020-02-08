import { DGTProviderState } from './dgt-provider-state.model';
import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTProvider<T> extends DGTEntity {
    configuration: T;
    state: DGTProviderState;
    source: string;
}
