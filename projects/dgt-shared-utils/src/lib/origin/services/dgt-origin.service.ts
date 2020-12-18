import { DGTInjectable } from '../../decorators/dgt-injectable';

@DGTInjectable()
export abstract class DGTOriginService {
    public abstract get(): string;
}
