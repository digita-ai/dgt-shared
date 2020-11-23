import { DGTMap } from '@digita-ai/dgt-shared-utils';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

export class DGTMockDatabase extends DGTMap<string, DGTLDResource[]>  {
    constructor(map: DGTMap<string, DGTLDResource[]> | Array<{ key: string, value: DGTLDResource[] }> = null) {
        super(map);
    }
}
