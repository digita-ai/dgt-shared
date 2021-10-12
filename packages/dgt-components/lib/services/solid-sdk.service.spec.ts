import { SolidSDKService } from './solid-sdk.service';

describe('SolidSDKService', () => {

  let service: SolidSDKService;

  beforeEach(async () => {

    service = new SolidSDKService('test');

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(service['options'].restorePreviousSession).toBeTruthy();

  });

});
