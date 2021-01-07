import { async } from '@angular/core/testing';
import { DGTTestRunnerService } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTLDFilterBGP } from '../models/dgt-ld-filter-bgp.model';
import { DGTLDFilterByCombinationType } from '../models/dgt-ld-filter-combination-type.model';
import { DGTLDFilterCombination } from '../models/dgt-ld-filter-combination.model';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDFilterRunnerBGPService } from './dgt-ld-filter-runner-bgp.service';
import { DGTLDFilterService } from './dgt-ld-filter.service';
import { DGTCategoryFilterService } from './dgt-ld-filter.service';

/* tslint:disable:no-unused-variable */

describe('DGTLDFilterService', () => {
    const testService = new DGTTestRunnerService<DGTLDFilterService>(configuration);
    testService.setup(DGTLDFilterService);

    it('should be correctly instantiated', async(() => {
        expect(testService.service).toBeTruthy();
    }));

    it('should run when 1 bgp filter is set', async(() => {
        const triples: DGTLDTriple[] = [
            {
                predicate: 'foobar',
                subject: null,
                object: null,
            },
            {
                predicate: 'foobar2',
                subject: null,
                object: null,
            },
        ];

        const filter: DGTLDFilterBGP = {
            type: DGTLDFilterType.BGP,
            predicates: [
                'foobar',
            ],
        };

        const filteredTriples: DGTLDTriple[] = [
            {
                predicate: 'foobar',
                subject: null,
                object: null,
            },
        ];

        const resource: DGTLDResource = {
            triples,
            uri: null,
            exchange: null,
        }

        const filteredResource: DGTLDResource = {
            triples: filteredTriples,
            uri: null,
            exchange: null,
        }

        testService.service.registerRunnerService(new DGTLDFilterRunnerBGPService());

        testService.service.run(filter, [resource])
            .subscribe(t => {
                expect(t).toEqual([filteredResource]);
            });
    }));

    xit('should run when 2 different bgp filters are set', async(() => {
        const triples: DGTLDTriple[] = [
            {
                predicate: 'foobar',
                subject: null,
                object: null,
            },
            {
                predicate: 'foobar2',
                subject: null,
                object: null,
            },
            {
                predicate: 'foobar3',
                subject: null,
                object: null,
            },
        ];

        const filter1: DGTLDFilterBGP = {
            type: DGTLDFilterType.BGP,
            predicates: [
                'foobar',
            ],
        };

        const filter2: DGTLDFilterBGP = {
            type: DGTLDFilterType.BGP,
            predicates: [
                'foobar2',
            ],
        };

        const filter: DGTLDFilterCombination = {
            type: DGTLDFilterType.COMBINATION,
            combinationType: DGTLDFilterByCombinationType.AND,
            filters: [filter1, filter2],
        }

        const filteredTriples: DGTLDTriple[] = [
            {
                predicate: 'foobar',
                subject: null,
                object: null,
            },
            {
                predicate: 'foobar2',
                subject: null,
                object: null,
            },
        ];

        const resource: DGTLDResource = {
            triples,
            uri: null,
            exchange: null,
        }

        const filteredResource: DGTLDResource = {
            triples: filteredTriples,
            uri: null,
            exchange: null,
        }

        testService.service.registerRunnerService(new DGTLDFilterRunnerBGPService());

        testService.service.run(filter, [resource])
            .subscribe(t => {
                expect(t).toEqual([filteredResource]);
            });
    }));

    xit('should run when 2 overlapping bgp filters are set', async(() => {
        const triples: DGTLDTriple[] = [
            {
                predicate: 'foobar',
                subject: null,
                object: null,
            },
            {
                predicate: 'foobar2',
                subject: null,
                object: null,
            },
            {
                predicate: 'foobar3',
                subject: null,
                object: null,
            },
        ];

        const filter1: DGTLDFilterBGP = {
            type: DGTLDFilterType.BGP,
            predicates: [
                'foobar',
            ],
        };

        const filter2: DGTLDFilterBGP = {
            type: DGTLDFilterType.BGP,
            predicates: [
                'foobar', 'foobar2',
            ],
        };

        const filter: DGTLDFilterCombination = {
            type: DGTLDFilterType.COMBINATION,
            combinationType: DGTLDFilterByCombinationType.AND,
            filters: [filter1, filter2],
        }

        const filteredTriples: DGTLDTriple[] = [
            {
                predicate: 'foobar',
                subject: null,
                object: null,
            },
            {
                predicate: 'foobar2',
                subject: null,
                object: null,
            },
        ];

        const resource: DGTLDResource = {
            triples,
            uri: null,
            exchange: null,
        }

        const filteredResource: DGTLDResource = {
            triples: filteredTriples,
            uri: null,
            exchange: null,
        }

        testService.service.registerRunnerService(new DGTLDFilterRunnerBGPService());

        testService.service.run(filter, [resource])
            .subscribe(t => {
                expect(t).toEqual([filteredResource]);
            });
    }));

});
