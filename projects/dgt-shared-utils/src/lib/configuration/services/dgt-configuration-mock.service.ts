import { DGTLoggerLevel } from '../../logging/models/dgt-logger-level.model';
import { DGTConfigurationBase } from '../models/dgt-configuration-base.model';
import { DGTConfigurationService } from './dgt-configuration.service';

export class DGTConfigurationMockService<T extends DGTConfigurationBase> extends DGTConfigurationService<T> {
    private config: DGTConfigurationBase = {
        baseURI: 'test',
        logger: {
            minimumLevel: DGTLoggerLevel.DEBUG,
        },
        typeRegistrations: {
            'test': 'test'
        },
    }

    public get<S>(configFn: (config: T) => S): S {
        return configFn(this.config as T);
    }
}
