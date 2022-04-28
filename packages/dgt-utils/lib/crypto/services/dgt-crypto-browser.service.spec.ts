/**
 * @jest-environment node
 */
import { DGTCryptoBrowserService } from './dgt-crypto-browser.service';

describe('DGTCryptoBrowserService', () => {

  let service: DGTCryptoBrowserService;

  beforeEach(async () => {

    service = new DGTCryptoBrowserService();

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

});
