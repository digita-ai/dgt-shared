import { DGTInjectable } from '@digita/dgt-shared-utils';


@DGTInjectable()
export class DGTLDUtils {
    public same(predicate1: string, predicate2: string): boolean {
        return predicate1 && predicate2 && predicate1 === predicate2;
    }
}
