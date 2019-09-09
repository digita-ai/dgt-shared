import { DGTMap } from '@digita/dgt-shared-utils';
import { DGTEntity } from './dgt-entity.model';

export class DGTMockDatabase extends DGTMap<string, DGTEntity[]>  {
    constructor(map: DGTMap<string, DGTEntity[]> | Array<{ key: string, value: DGTEntity[] }> = null) {
        super(map);
    }
}
