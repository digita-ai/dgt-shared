import { async } from '@angular/core/testing';
import { DGTTestRunnerService } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTLDFilterBGP } from '../models/dgt-ld-filter-bgp.model';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDFilterRunnerBGPService } from './dgt-ld-filter-runner-bgp.service';
import { DGTCategoryFilterService } from './dgt-ld-filter.service';

/* tslint:disable:no-unused-variable */

describe('DGTCategoryFilterService', () => {
    const testService = new DGTTestRunnerService<DGTCategoryFilterService>(configuration);
    testService.setup(DGTCategoryFilterService);

    it('should be correctly instantiated', async(() => {
        expect(testService.service).toBeTruthy();
    }));

    it('should run when 1 bgp filter is set', async(() => {
        const triples: DGTLDTriple[] = [
            {
                exchange: null,
                predicate: 'foobar',
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: 'foobar2',
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
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
                exchange: null,
                predicate: 'foobar',
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
        ];

        testService.service.register(new DGTLDFilterRunnerBGPService());

        testService.service.run([filter], triples)
            .subscribe(t => {
                expect(t).toEqual(filteredTriples);
            });
    }));

    it('should run when 2 different bgp filters are set', async(() => {
        const triples: DGTLDTriple[] = [
            {
                exchange: null,
                predicate: 'foobar',
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: 'foobar2',
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: 'foobar3',
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
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

        const filteredTriples: DGTLDTriple[] = [
            {
                exchange: null,
                predicate: 'foobar',
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: 'foobar2',
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
        ];

        testService.service.register(new DGTLDFilterRunnerBGPService());

        testService.service.run([filter1, filter2], triples)
            .subscribe(this => {
                expect(t).toEqual(filteredTriples),
            });
    }));

    it('should run when 2 overlapping bgp filters are set', async(() => {
        const triples: DGTLDTriple[] = [
            {
                exchange: null,
                predicate: 'foobar',
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: 'foobar2',
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: 'foobar3',
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
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

        const filteredTriples: DGTLDTriple[] = [
            {
                exchange: null,
                predicate: 'foobar',
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: 'foobar2',
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
        ];

        testService.service.register(new DGTLDFilterRunnerBGPService());

        testService.service.run([filter1, filter2], triples)
            .subscribe(t => {
                expect(t).toEqual(filteredTriples);
            });
    }));

});
