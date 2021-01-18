import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';

@DGTInjectable()
export class DGTLDUtils {
    constructor(private logger: DGTLoggerService) {}

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

        return triples.filter((tr) => predicates.find((pred) => tr.predicate === pred)?.length > 0);
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

    public combineResources<T extends DGTLDResource>(resources: T[]): T[] {
        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        let res: T[] = [];

        const groupedResources = _.groupBy(resources, 'uri');

        for (const uri of Object.keys(groupedResources)) {
            const resourcesForUri = groupedResources[uri];
            const triples = _.flatten(resourcesForUri.map((resource) => resource.triples));
            const firstResource = _.head(resourcesForUri);

            res = [...res, { ...firstResource, uri, triples }];
        }

        return res;
    }
}
