import { Injectable } from "@angular/core";
import { DGTPlatformService } from '../../platform/services/dgt-platform.service';
import { DGTPlatformType } from '../../platform/models/dgt-platform-type.model';
import { DGTConfigurationService } from '../../configuration/services/dgt-configuration.service';
import { DGTConfigurationBase } from '../../configuration/models/dgt-configuration-base.model';

@Injectable()
export class DGTEnvironmentService {
    public baseUri: string;

    constructor(private platform: DGTPlatformService, private config: DGTConfigurationService<DGTConfigurationBase>) {
        if(platform.type === DGTPlatformType.BROWSER) {
            this.baseUri = `${window.location.origin}/`;
        } else {
            this.baseUri = this.config.get(c => c.baseURI);
        }
     }
}