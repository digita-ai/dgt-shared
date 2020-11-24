import { DGTConfigurationBase } from '../models/dgt-configuration-base.model';

export abstract class DGTConfigurationService<T extends DGTConfigurationBase> {
    public abstract get<S>(configFn: (config: T) => S): S;
}
