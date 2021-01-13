import { DGTLDResource, DGTLDTriple } from '@digita-ai/dgt-shared-data/public-api';
import { DGTInjectable, DGTLoggerService, DGTErrorArgument } from '@digita-ai/dgt-shared-utils';

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

    public filterTriplesByPredicates(triples: DGTLDTriple[], predicates: string[]): DGTLDTriple[] {
        if (!triples) {
            throw new DGTErrorArgument('Parameter triples should be set', triples);
        }
        if (!predicates) {
            throw new DGTErrorArgument('Parameter predicates should be set', predicates);
        }

        return triples.filter(tr => predicates.find(pred => tr.predicate === pred)?.length > 0);
    }

    public filterResourceByPredicates<T extends DGTLDResource>(resource: T, predicates: string[]): T {
        if (!resource) {
            throw new DGTErrorArgument('Parameter resource should be set', resource);
        }
        if (!predicates) {
            throw new DGTErrorArgument('Parameter predicates should be set', predicates);
        }
        if (!resource.triples) {
            throw new DGTErrorArgument('Parameter resource.triples should be set', resource.triples);
        }

        return {
            ...resource,
            triples: this.filterTriplesByPredicates(resource.triples, predicates),
        } as T;
    }
}
