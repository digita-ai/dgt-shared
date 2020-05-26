import { DGTTestRunnerService } from '@digita/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { async } from '@angular/core/testing';
import { DGTLDPredicate } from '../../linked-data/models/dgt-ld-predicate.model';
import { DGTCategoryFilterRunnerBGPService } from './dgt-category-filter-runner-bgp.service';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTCategoryFilterBGP } from '../models/dgt-category-filter-bgp.model';
import { DGTCategoryFilterType } from '../models/dgt-category-filter-type.model';

/* tslint:disable:no-unused-variable */

describe('DGTCategoryFilterRunnerBGP', () => {
    const testService = new DGTTestRunnerService<DGTCategoryFilterRunnerBGPService>(configuration);
    testService.setup(DGTCategoryFilterRunnerBGPService);

    it('should be correctly instantiated', async(() => {
        expect(testService.service).toBeTruthy();
    }));

    it('should filter triples when 1 predicate is given', async(() => {
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

        testService.service.run(filter, triples)
            .subscribe(triples => {
                expect(triples).toEqual(filteredTriples);
            });
    }));

    it('should filter triples when multiple predicates are given', async(() => {
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

        const filter: DGTCategoryFilterBGP = {
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
            },
        ];

        testService.service.run(filter, triples)
            .subscribe(triples => {
                expect(triples).toEqual(filteredTriples);
            });
    }));

    // it('should register and get a workflow', async(() => {
    //     const field: DGTLDPredicate = {
    //         namespace: 'digita.ai/',
    //         name: 'test'
    //     };

    //     const workflow: DGTWorkflow = {
    //         trigger: {
    //             fields: [field]
    //         },
    //         actions: []
    //     };
    //     testService.service.register(workflow);

    //     expect(testService.service.get(field)).toEqual([workflow]);
    // }));
});
