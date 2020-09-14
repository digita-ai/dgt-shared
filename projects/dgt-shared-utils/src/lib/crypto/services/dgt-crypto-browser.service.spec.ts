import { DGTTestRunnerService } from '@digita/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { async } from '@angular/core/testing';
import { DGTCryptoBrowserService } from './dgt-crypto-browser.service';

/* tslint:disable:no-unused-variable */

describe('DGTCryptoBrowserService', () => {
    const testService = new DGTTestRunnerService<DGTCryptoBrowserService>(configuration);
    testService.setup(DGTCryptoBrowserService);

    it('should be correctly instantiated', async(() => {
        expect(testService.service).toBeTruthy();
    }));

    it('should log a debug message', async((done) => {
        testService.service.generateKeyPair()
        .subscribe(
            (keyPair) => {
                // public: alg="RS256", e="AQAB", ext=true, key_ops=["verify"], kty="RSA", n
                // private: alg="RS256", d, dp, dq,e="AQAB" ,ext=true, key_ops=["sign"], kty="RSA", n, q, p, qi
                expect(keyPair).toBeTruthy();
                done();
            }
        )
    }));
});

