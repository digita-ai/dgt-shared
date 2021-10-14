import { addUrl, createThing } from '@inrupt/solid-client';
import { SolidService } from './solid.service';
import { SolidSDKService } from './solid-sdk.service';

describe('SolidSDKService', () => {

  let service: SolidService;

  const mockWebId = 'https://pods.digita.ai/leapeeters/profile/card#me';
  const mockStorage = mockWebId.replace('profile/card#me', '');
  let mockProfile = createThing({ url: mockWebId });
  mockProfile = addUrl(mockProfile, 'http://www.w3.org/ns/pim/space#storage', mockStorage);

  beforeEach(async () => {

    service = new SolidSDKService('test');

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  it('getStorages', async () => {

    // eslint-disable-next-line @typescript-eslint/dot-notation
    service['getProfileThing'] = jest.fn(async () => mockProfile);

    const result = await service.getStorages(mockWebId);
    expect(result.length).toEqual(1);
    expect(result).toContain(mockStorage);

  });

});
