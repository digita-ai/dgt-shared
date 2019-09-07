import { DGTMap } from '../../collections/models/dgt-map.model';
import { DGTEntity } from './dgt-entity.model';

export class DGTMockDatabase extends DGTMap<string, DGTEntity[]>  {
    constructor(map: DGTMap<string, DGTEntity[]> | Array<{ key: string, value: DGTEntity[] }> = null) {
        super(map);
    }
}
