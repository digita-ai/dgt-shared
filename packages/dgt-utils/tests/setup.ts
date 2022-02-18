import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

// mock all requests to localization assets
fetchMock.mockIf(/.*\.json$/, '{}');
