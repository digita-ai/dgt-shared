import { DGTProviderState } from './dgt-provider-state.model';
import { DGTEntity } from '@digita/dgt-shared-data';

export interface DGTProvider<T> extends DGTEntity {
    configuration: T;
    state: DGTProviderState;
    source: string;
}
