import { DGTSource } from './dgt-source.model';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';

export interface DGTSourceResult {
    source: DGTSource;
    values: DGTLDValue[];
}
