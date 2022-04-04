import { ConsoleLogger } from '@digita-ai/handlersjs-logging';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

// mock all requests to localization assets
fetchMock.mockIf(/.*\.json$/, '{}');

jest.mock('@digita-ai/handlersjs-logging', () => ({
    ... jest.requireActual('@digita-ai/handlersjs-logging') as any,
    getLogger: () => new ConsoleLogger('UTILS', 6, 6),
    getLoggerFor: () => new ConsoleLogger('UTILS', 6, 6),
  }));  
