import { DGTTestRunnerService } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { async } from '@angular/core/testing';
import { DGTCategoryFilterRunnerSparqlService } from './dgt-ld-filter-runner-sparql.service';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDFilterSparql } from '../models/dgt-ld-filter-sparql.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';

/* tslint:disable:no-unused-variable */

fdescribe('DGTCategoryFilterRunnerSparqlService', () => {
    const testService = new DGTTestRunnerService<DGTCategoryFilterRunnerSparqlService>(configuration);
    testService.setup(DGTCategoryFilterRunnerSparqlService);

    it('should be correctly instantiated', async(() => {
        expect(testService.service).toBeTruthy();
    }));

    it('should filter triples when 1 predicate is given', async(() => {
        const triples: DGTLDTriple[] = [
            {
                exchange: null,
                predicate: 'http://foo.bar/ns#bar1',
                subject: {
                    termType: DGTLDTermType.REFERENCE,
                    value: 'https://me.myid.be/profile/card#me'
                },
                object: {
                    termType: DGTLDTermType.LITERAL,
                    value: 'lorem1'
                },
                originalValue: {
                    termType: DGTLDTermType.LITERAL,
                    value: 'lorem1'
                },
                source: null,
                connection: null,
            },
            {
                exchange: null,
                predicate: 'http://foo.bar/ns#bar2',
                subject: {
                    termType: DGTLDTermType.REFERENCE,
                    value: 'https://me.myid.be/profile/card#me'
                },
                object: {
                    termType: DGTLDTermType.LITERAL,
                    value: 'lorem2'
                },
                originalValue: {
                    termType: DGTLDTermType.LITERAL,
                    value: 'lorem2'
                },
                source: null,
                connection: null,
            }
        ];

        const filter: DGTLDFilterSparql = {
            type: DGTLDFilterType.BGP,
            sparql: `PREFIX foo:  <http://foo.bar/ns#>
            SELECT ?subject ?predicate ?object
            WHERE {
                ?subject ?predicate ?object .
                ?subject foo:bar1 ?object .
            }`
        };

        const filteredTriples: DGTLDTriple[] = [
            {
                exchange: null,
                predicate: 'http://foo.bar/ns#bar1',
                subject: {
                    termType: DGTLDTermType.REFERENCE,
                    value: 'https://me.myid.be/profile/card#me'
                },
                object: {
                    termType: DGTLDTermType.LITERAL,
                    value: 'lorem1'
                },
                originalValue: {
                    termType: DGTLDTermType.LITERAL,
                    value: 'lorem1'
                },
                source: null,
                connection: null,
            }
        ];

        testService.service.run(filter, triples)
            .subscribe(triples => {
                expect(triples).toEqual(filteredTriples);
            });
    }));

    // it('should filter triples when multiple predicates are given', async(() => {
    //     const triples: DGTLDTriple[] = [
    //         {
    //             exchange: null,
    //             predicate: {
    //                 namespace: 'foo',
    //                 name: 'bar'
    //             },
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         },
    //         {
    //             exchange: null,
    //             predicate: {
    //                 namespace: 'foo',
    //                 name: 'bar2'
    //             },
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         },
    //         {
    //             exchange: null,
    //             predicate: {
    //                 namespace: 'foo',
    //                 name: 'bar3'
    //             },
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         }
    //     ];

    //     const filter: DGTCategoryFilterBGP = {
    //         type: DGTCategoryFilterType.BGP,
    //         predicates: [
    //             {
    //                 namespace: 'foo',
    //                 name: 'bar'
    //             },
    //             {
    //                 namespace: 'foo',
    //                 name: 'bar2'
    //             }
    //         ]
    //     };

    //     const filteredTriples: DGTLDTriple[] = [
    //         {
    //             exchange: null,
    //             predicate: {
    //                 namespace: 'foo',
    //                 name: 'bar'
    //             },
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         },
    //         {
    //             exchange: null,
    //             predicate: {
    //                 namespace: 'foo',
    //                 name: 'bar2'
    //             },
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         },
    //     ];

    //     testService.service.run(filter, triples)
    //         .subscribe(triples => {
    //             expect(triples).toEqual(filteredTriples);
    //         });
    // }));

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
