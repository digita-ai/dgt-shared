import * as utils from '@digita-ai/dgt-utils';
import { AuthenticateContext, WebIdEnteredEvent }  from './authenticate.machine';
import { checkWebId } from './authenticate.services';

jest.mock('@digita-ai/dgt-utils', () => ({
  addProtocolPrefix: jest.fn().mockResolvedValue('https://example.com/profile/card'),
}));

describe('AuthenticateServices', () => {

  const prefixedUri = 'https://example.com/profile/card';
  let mockContext: AuthenticateContext;
  let mockEvent: WebIdEnteredEvent;
  let mockWebIdValidator: jest.Mock;

  beforeEach(() => {

    mockWebIdValidator = jest.fn().mockResolvedValue([]);
    mockContext = { webIdValidator: mockWebIdValidator };
    mockEvent = { webId: prefixedUri.split('//')[1] } as unknown as WebIdEnteredEvent;

  });

  describe('checkWebId', () => {

    it('should call addProtocolPrefix() and context.webIdValidator() and return their values', async () => {

      const addProtocolSpy = jest.spyOn(utils, 'addProtocolPrefix');
      const result = checkWebId(mockContext, mockEvent);

      await expect(result).resolves.toMatchObject({
        webId: prefixedUri,
        validationResults: [],
      });

      expect(addProtocolSpy).toHaveBeenCalledTimes(1);
      expect(addProtocolSpy).toHaveBeenCalledWith(mockEvent.webId);
      expect(mockWebIdValidator).toHaveBeenCalledTimes(1);
      expect(mockWebIdValidator).toHaveBeenCalledWith(prefixedUri);

    });

    it('should return original webid and add a value to validationResults when addProtocolPrefix throws', async () => {

      jest.spyOn(utils, 'addProtocolPrefix').mockRejectedValueOnce('');

      await expect(checkWebId(mockContext, mockEvent)).resolves.toMatchObject({
        webId: mockEvent.webId,
        validationResults: [ expect.any(String) ],
      });

    });

  });

});
