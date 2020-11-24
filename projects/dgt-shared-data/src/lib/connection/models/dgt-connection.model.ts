import { DGTConnectionState } from './dgt-connection-state.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

export interface DGTConnection<T> extends DGTLDResource {
    configuration: T;
    state: DGTConnectionState;
    source: string;
    holder?: string;
}
