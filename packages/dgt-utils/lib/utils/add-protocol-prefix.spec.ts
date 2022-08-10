/* eslint-disable @typescript-eslint/no-explicit-any */
import crossFetch from 'cross-fetch';
import { addProtocolPrefix } from './add-protocol-prefix';

// Mock the default export
jest.mock('cross-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const nonPrefixedUri = 'example.com';
const httpsUri = `https://${nonPrefixedUri}`;
const httpUri = `http://${nonPrefixedUri}`;

describe('addProtocolPrefix()', () => {

  it('should return uri when uri already is prefixed', async () => {

    await expect(addProtocolPrefix(httpsUri)).resolves.toBe(httpsUri);
    await expect(addProtocolPrefix(httpUri)).resolves.toBe(httpUri);

  });

  it('should return uri prefixed with https if HEAD request succeeds', async () => {

    ((crossFetch as unknown) as jest.MockInstance<any, any>).mockResolvedValueOnce('');

    await expect(addProtocolPrefix(nonPrefixedUri)).resolves.toBe(httpsUri);

  });

  it('should return uri prefixed with http if HEAD request succeeds', async () => {

    ((crossFetch as unknown) as jest.MockInstance<any, any>).mockRejectedValueOnce('');
    ((crossFetch as unknown) as jest.MockInstance<any, any>).mockResolvedValueOnce('');

    await expect(addProtocolPrefix(nonPrefixedUri)).resolves.toBe(httpUri);

  });

  it('should throw when both http and https uris cannot be fetched', async () => {

    ((crossFetch as unknown) as jest.MockInstance<any, any>).mockRejectedValue('');

    await expect(addProtocolPrefix(nonPrefixedUri)).rejects.toThrow(`Could not add protocol prefix to ${nonPrefixedUri}`);

  });

});
