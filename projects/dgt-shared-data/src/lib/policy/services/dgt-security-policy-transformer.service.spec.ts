import { DGTTestRunnerService } from '@digita-ai/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { async } from '@angular/core/testing';
import { DGTSecurityPolicyTransformerService } from './dgt-security-policy-transformer.service';

/* tslint:disable:no-unused-variable */

describe('DGTSecurityPolicyTransformerService', () => {
    const testService = new DGTTestRunnerService<DGTSecurityPolicyTransformerService>(configuration);
    testService.setup(DGTSecurityPolicyTransformerService);

    it('should be correctly instantiated', async(() => {
        expect(testService.service).toBeTruthy();
    }));

    // it('should run when 1 bgp filter is set', async(() => {
    //     const triples: DGTLDTriple[] = [
    //         {
    //             exchange: null,
    //             predicate: 'foobar',
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         },
    //         {
    //             exchange: null,
    //             predicate: 'foobar2',
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         }
    //     ];

    //     const filter: DGTLDFilterBGP = {
    //         type: DGTLDFilterType.BGP,
    //         predicates: [
    //             'foobar'
    //         ]
    //     };

    //     const filteredTriples: DGTLDTriple[] = [
    //         {
    //             exchange: null,
    //             predicate: 'foobar',
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         }
    //     ];

    //     testService.service.register(new DGTLDFilterRunnerBGPService());

    //     testService.service.run([filter], triples)
    //         .subscribe(triples => {
    //             expect(triples).toEqual(filteredTriples);
    //         });
    // }));

    // it('should run when 2 different bgp filters are set', async(() => {
    //     const triples: DGTLDTriple[] = [
    //         {
    //             exchange: null,
    //             predicate: 'foobar',
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         },
    //         {
    //             exchange: null,
    //             predicate: 'foobar2',
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         },
    //         {
    //             exchange: null,
    //             predicate: 'foobar3',
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         }
    //     ];

    //     const filter1: DGTLDFilterBGP = {
    //         type: DGTLDFilterType.BGP,
    //         predicates: [
    //             'foobar'
    //         ]
    //     };

    //     const filter2: DGTLDFilterBGP = {
    //         type: DGTLDFilterType.BGP,
    //         predicates: [
    //             'foobar2'
    //         ]
    //     };

    //     const filteredTriples: DGTLDTriple[] = [
    //         {
    //             exchange: null,
    //             predicate: 'foobar',
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         },
    //         {
    //             exchange: null,
    //             predicate: 'foobar2',
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         }
    //     ];

    //     testService.service.register(new DGTLDFilterRunnerBGPService());

    //     testService.service.run([filter1, filter2], triples)
    //         .subscribe(triples => {
    //             expect(triples).toEqual(filteredTriples);
    //         });
    // }));

    // it('should run when 2 overlapping bgp filters are set', async(() => {
    //     const triples: DGTLDTriple[] = [
    //         {
    //             exchange: null,
    //             predicate: 'foobar',
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         },
    //         {
    //             exchange: null,
    //             predicate: 'foobar2',
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         },
    //         {
    //             exchange: null,
    //             predicate: 'foobar3',
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         }
    //     ];

    //     const filter1: DGTLDFilterBGP = {
    //         type: DGTLDFilterType.BGP,
    //         predicates: [
    //             'foobar'
    //         ]
    //     };

    //     const filter2: DGTLDFilterBGP = {
    //         type: DGTLDFilterType.BGP,
    //         predicates: [
    //             'foobar', 'foobar2'
    //         ]
    //     };

    //     const filteredTriples: DGTLDTriple[] = [
    //         {
    //             exchange: null,
    //             predicate: 'foobar',
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         },
    //         {
    //             exchange: null,
    //             predicate: 'foobar2',
    //             subject: null,
    //             object: null,
    //             originalValue: null,
    //             source: null,
    //             connection: null,
    //         }
    //     ];

    //     testService.service.register(new DGTLDFilterRunnerBGPService());

    //     testService.service.run([filter1, filter2], triples)
    //         .subscribe(triples => {
    //             expect(triples).toEqual(filteredTriples);
    //         });
    // }));

});
