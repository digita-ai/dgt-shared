import { DGTOriginService } from './dgt-origin.service';
import { DGTConfigurationService } from '../../configuration/services/dgt-configuration.service';
import { DGTConfigurationBase } from '../../configuration/models/dgt-configuration-base.model';
import { DGTInjectable } from '../../decorators/dgt-injectable';


@DGTInjectable()
export class DGTOriginConfigService extends DGTOriginService {

    constructor(private config: DGTConfigurationService<DGTConfigurationBase>) { super(); }

    public get(): string {
        return this.config.get(c => c.baseURI);
    }
}