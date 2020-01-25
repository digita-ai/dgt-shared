import { DGTSource } from './dgt-source.model';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';

export interface DGTSourceResult<T> {
    source: DGTSource<T>;
    values: DGTLDValue[];
}
