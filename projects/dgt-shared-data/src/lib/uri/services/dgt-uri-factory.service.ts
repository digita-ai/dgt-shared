import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

@DGTInjectable()
export abstract class DGTUriFactoryService {

    public abstract generate(resource: DGTLDResource): string;
}
