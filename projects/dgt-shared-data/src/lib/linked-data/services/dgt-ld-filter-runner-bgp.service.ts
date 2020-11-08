import { DGTLDFilterBGP } from '../models/dgt-ld-filter-bgp.model';
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { Observable, of } from 'rxjs';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';


@DGTInjectable()
export class DGTLDFilterRunnerBGPService implements DGTLDFilterRunnerService<DGTLDFilterBGP> {
    public readonly type: DGTLDFilterType = DGTLDFilterType.BGP;

    run<R extends DGTLDResource>(filter: DGTLDFilterBGP, resources: R[]): Observable<R[]> {
        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!resources) {
            throw new DGTErrorArgument('Argument triresourcesples should be set.', resources);
        }

        return of(resources.map(resource => this.runOne<R>(filter, resource)));
    }

    private runOne<R extends DGTLDResource>(filter: DGTLDFilterBGP, resource: R): R {
        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!resource) {
            throw new DGTErrorArgument('Argument triple should be set.', resource);
        }

        const res = { ...resource };

        res.triples = res.triples.filter(triple => filter.predicates.find(
            predicate => predicate === triple.predicate
        ))

        return res;
    }
}
