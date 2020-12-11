import { DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';


@DGTInjectable()
export class DGTLDUtils {
    constructor(private logger: DGTLoggerService) { }

    public same(predicate1: string, predicate2: string): boolean {
        return predicate1 && predicate2 && predicate1 === predicate2;
    }

    public isUrl(url: string): boolean {
        this.logger.debug(DGTLDUtils.name, 'Checking if url', { url });

        let res = true;

        try {
            const parsed = new URL(url);
        } catch (_) {
            res = false;
        }

        return res;
    }
}
