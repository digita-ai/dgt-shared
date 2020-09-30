import { DGTTestRunnerService } from '@digita/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { async } from '@angular/core/testing';
import { DGTLDFilterRunnerBGPService } from './dgt-ld-filter-runner-bgp.service';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTLDFilterBGP } from '../models/dgt-ld-filter-bgp.model';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';

/* tslint:disable:no-unused-variable */

describe('DGTCategoryFilterRunnerBGP', () => {
    const testService = new DGTTestRunnerService<DGTLDFilterRunnerBGPService>(configuration);
    testService.setup(DGTLDFilterRunnerBGPService);

    it('should be correctly instantiated', async(() => {
        expect(testService.service).toBeTruthy();
    }));

    it('should filter triples when 1 predicate is given', async(() => {
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
            }
        ];

        const filter: DGTLDFilterBGP = {
            type: DGTLDFilterType.BGP,
            predicates: [
               'foobar'
            ]
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
            }
        ];

        const filter: DGTLDFilterBGP = {
            type: DGTLDFilterType.BGP,
            predicates: [
                'foobar',
                'foobar2'
            ]
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
                predicate: 'foobar',
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
    //     const field: string = 'digita.ai/test'

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
