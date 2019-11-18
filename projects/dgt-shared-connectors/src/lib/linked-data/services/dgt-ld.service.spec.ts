import { DGTTestRunnerService } from '@digita/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { async } from '@angular/core/testing';
import { DGTLDService } from './dgt-ld.service';
import { DGTExchange, DGTJustification, DGTSource, DGTSourceType } from '@digita/dgt-shared-data';

/* tslint:disable:no-unused-variable */

describe('DGTLDService', () => {
    const testService = new DGTTestRunnerService<DGTLDService>(configuration);
    testService.setup(DGTLDService);

    it('should be correctly instantiated', async(() => {
        expect(testService.service).toBeTruthy();
    }));

    it('should retrieve linked data when querying', ((done) => {
        const webId = 'https://wouteraj.inrupt.net/profile/card#me';
        const exchange: DGTExchange = {
            id: '1',
            justification: '1',
            subject: '1',
        };
        const justification: DGTJustification = {
            id: '1',
            fields: [
                {
                    namespace: 'http://www.w3.org/2006/vcard/ns#',
                    name: 'fn',
                },
                {
                    namespace: 'http://xmlns.com/foaf/0.1#',
                    name: 'name',
                },
                {
                    namespace: 'http://www.w3.org/2006/vcard/ns#',
                    name: 'hasEmail',
                },
                {
                    namespace: 'http://www.w3.org/2006/vcard/ns#',
                    name: 'hasTelephone',
                },
            ],
        };
        const source: DGTSource = {
            id: '1',
            subject: '1',
            type: DGTSourceType.SOLID,
            uri: 'https://wouteraj.inrupt.net/profile/card#me',
        };

        testService.service.query(webId, exchange, justification, source)
        .subscribe(response => {
            expect(response).toBeTruthy();
            done();
        });
    }));
});
