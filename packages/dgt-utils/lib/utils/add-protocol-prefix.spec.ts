import fetchMock from 'jest-fetch-mock';
import { addProtocolPrefix } from './add-protocol-prefix';

const MOCK_URI = 'example.com';

fetchMock.enableMocks();

beforeEach(() => {

  fetchMock.resetMocks();

});

describe('addProtocolPrefix()', () => {

  it('should return uri with https when https is working', async () => {

    fetchMock.mockResponseOnce(JSON.stringify({ uri: 'https://' + MOCK_URI }));

    const response = addProtocolPrefix(MOCK_URI);

    await expect(response).resolves.toBe('https://' + MOCK_URI);

  });

  it('should return uri with http when https is not working', async () => {

    fetchMock.mockRejectOnce();
    fetchMock.mockResponseOnce(JSON.stringify({ uri: 'http://' + MOCK_URI }));

    const response = addProtocolPrefix(MOCK_URI);

    await expect(response).resolves.toBe('http://' + MOCK_URI);

  });

  it('should throw when uri cannot be fetched', async () => {

    fetchMock.mockReject();

    const response = addProtocolPrefix(MOCK_URI);

    await expect(response).rejects.toThrow(`Could not add protocol prefix to ${MOCK_URI}`);

  });

});

