import { addUrl, createSolidDataset, createThing, saveSolidDatasetAt } from '@inrupt/solid-client';
import * as sdk from '@inrupt/solid-client';
import { Issuer } from '../models/issuer.model';
import { SolidSDKService } from './solid-sdk.service';

describe('SolidSDKService', () => {

  let service: SolidSDKService;

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

  describe('addIssuers', () => {

    it('should add issuer triples to profile', async () => {

      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['getProfileThing'] = jest.fn(async () => mockProfile);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['getProfileDataset'] = jest.fn(async () => createSolidDataset());
      (saveSolidDatasetAt as any) = jest.fn(async () => createSolidDataset());

      const newIssuers: Issuer[] = [ {
        icon: '',
        description: '',
        uri: 'https://test.uri/',
      } ];

      const addUrlSpy = spyOn(sdk, 'addUrl');
      const setThingSpy = spyOn(sdk, 'setThing');

      const result = await service.addIssuers(mockWebId, newIssuers);
      expect(result).toEqual(newIssuers);
      expect(addUrlSpy).toHaveBeenCalledTimes(newIssuers.length);
      expect(setThingSpy).toHaveBeenCalledTimes(1);
      expect(sdk.saveSolidDatasetAt).toHaveBeenCalledTimes(1);

    });

  });

  describe('getStorages', () => {

    it('should return correct values', async () => {

      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['getProfileThing'] = jest.fn(async () => mockProfile);

      const result = await service.getStorages(mockWebId);
      expect(result.length).toEqual(1);
      expect(result).toContain(mockStorage);

    });

  });

  describe('getProfileThing', () => {

    it('should error when webId is undefined', async () => {

      // eslint-disable-next-line @typescript-eslint/dot-notation
      await expect(() => service['getProfileThing'](undefined)).rejects.toThrow();

    });

    it('should error when webId is invalid', async () => {

      // eslint-disable-next-line @typescript-eslint/dot-notation
      await expect(service['getProfileThing']('invalid-url')).rejects.toThrow();

    });

  });

});
