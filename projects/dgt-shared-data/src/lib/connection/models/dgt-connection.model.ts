import { DGTConnectionState } from './dgt-connection-state.model';
import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTConnection<T> extends DGTEntity {
    configuration: T;
    state: DGTConnectionState;
    source: string;
    subject?: string;
    invite?: string;
}
