import { DGTTestRunnerService } from '@digita/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { async } from '@angular/core/testing';
import { DGTLDPredicate } from '../../linked-data/models/dgt-ld-predicate.model';
import { DGTCategoryFilterRunnerBGPService } from './dgt-category-filter-runner-bgp.service';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTCategoryFilterBGP } from '../models/dgt-category-filter-bgp.model';
import { DGTCategoryFilterType } from '../models/dgt-category-filter-type.model';
import { DGTCategoryFilterService } from './dgt-category-filter.service';

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
                predicate: {
                    namespace: 'foo',
                    name: 'bar'
                },
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: {
                    namespace: 'foo',
                    name: 'bar2'
                },
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            }
        ];

        const filter: DGTCategoryFilterBGP = {
            type: DGTCategoryFilterType.BGP,
            predicates: [
                {
                    namespace: 'foo',
                    name: 'bar'
                }
            ]
        };

        const filteredTriples: DGTLDTriple[] = [
            {
                exchange: null,
                predicate: {
                    namespace: 'foo',
                    name: 'bar'
                },
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            }
        ];

        testService.service.register(new DGTCategoryFilterRunnerBGPService());

        testService.service.run([filter], triples)
            .subscribe(triples => {
                expect(triples).toEqual(filteredTriples);
            });
    }));

    it('should run when 2 different bgp filters are set', async(() => {
        const triples: DGTLDTriple[] = [
            {
                exchange: null,
                predicate: {
                    namespace: 'foo',
                    name: 'bar'
                },
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: {
                    namespace: 'foo',
                    name: 'bar2'
                },
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: {
                    namespace: 'foo',
                    name: 'bar3'
                },
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            }
        ];

        const filter1: DGTCategoryFilterBGP = {
            type: DGTCategoryFilterType.BGP,
            predicates: [
                {
                    namespace: 'foo',
                    name: 'bar'
                }
            ]
        };

        const filter2: DGTCategoryFilterBGP = {
            type: DGTCategoryFilterType.BGP,
            predicates: [
                {
                    namespace: 'foo',
                    name: 'bar2'
                }
            ]
        };

        const filteredTriples: DGTLDTriple[] = [
            {
                exchange: null,
                predicate: {
                    namespace: 'foo',
                    name: 'bar'
                },
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: {
                    namespace: 'foo',
                    name: 'bar2'
                },
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            }
        ];

        testService.service.register(new DGTCategoryFilterRunnerBGPService());

        testService.service.run([filter1, filter2], triples)
            .subscribe(triples => {
                expect(triples).toEqual(filteredTriples);
            });
    }));

    it('should run when 2 overlapping bgp filters are set', async(() => {
        const triples: DGTLDTriple[] = [
            {
                exchange: null,
                predicate: {
                    namespace: 'foo',
                    name: 'bar'
                },
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: {
                    namespace: 'foo',
                    name: 'bar2'
                },
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: {
                    namespace: 'foo',
                    name: 'bar3'
                },
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            }
        ];

        const filter1: DGTCategoryFilterBGP = {
            type: DGTCategoryFilterType.BGP,
            predicates: [
                {
                    namespace: 'foo',
                    name: 'bar'
                }
            ]
        };

        const filter2: DGTCategoryFilterBGP = {
            type: DGTCategoryFilterType.BGP,
            predicates: [
                {
                    namespace: 'foo',
                    name: 'bar'
                },
                {
                    namespace: 'foo',
                    name: 'bar2'
                }
            ]
        };

        const filteredTriples: DGTLDTriple[] = [
            {
                exchange: null,
                predicate: {
                    namespace: 'foo',
                    name: 'bar'
                },
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: {
                    namespace: 'foo',
                    name: 'bar2'
                },
                subject: null,
                object: null,
                originalValue: null,
                source: null,
                connection: null,
            }
        ];

        testService.service.register(new DGTCategoryFilterRunnerBGPService());

        testService.service.run([filter1, filter2], triples)
            .subscribe(triples => {
                expect(triples).toEqual(filteredTriples);
            });
    }));

});
