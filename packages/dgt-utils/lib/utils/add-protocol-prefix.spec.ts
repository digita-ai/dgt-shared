/* eslint-disable @typescript-eslint/no-explicit-any */
import crossFetch from 'cross-fetch';
import { addProtocolPrefix } from './add-protocol-prefix';

// Mock the default export
jest.mock('cross-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const MOCK_URI = 'example.com';

describe('addProtocolPrefix()', () => {

  it('should return uri with https when https is working', async () => {

    ((crossFetch as unknown) as jest.MockInstance<any, any>).mockResolvedValueOnce(JSON.stringify({ uri: 'https://' + MOCK_URI }));

    const response = addProtocolPrefix(MOCK_URI);

    await expect(response).resolves.toBe('https://' + MOCK_URI);

  });

  it('should return uri with http when https is not working', async () => {

    ((crossFetch as unknown) as jest.MockInstance<any, any>).mockRejectedValueOnce('addr_not_found');
    ((crossFetch as unknown) as jest.MockInstance<any, any>).mockResolvedValueOnce(JSON.stringify({ uri: 'http://' + MOCK_URI }));

    const response = addProtocolPrefix(MOCK_URI);

    await expect(response).resolves.toBe('http://' + MOCK_URI);

  });

  it('should throw when both http and https uris cannot be fetched', async () => {

    ((crossFetch as unknown) as jest.MockInstance<any, any>).mockRejectedValueOnce('addr_not_found');
    ((crossFetch as unknown) as jest.MockInstance<any, any>).mockRejectedValueOnce('addr_not_found');

    const response = addProtocolPrefix(MOCK_URI);

    await expect(response).rejects.toThrow(`Could not add protocol prefix to ${MOCK_URI}`);

  });

});
