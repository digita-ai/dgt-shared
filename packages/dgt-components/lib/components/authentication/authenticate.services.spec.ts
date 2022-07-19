import *  as utils  from '@digita-ai/dgt-utils';
import { AuthenticateContext, AuthenticateEvents, WebIdEnteredEvent, WebIdValidator }  from './authenticate.machine';
import { checkWebId } from './authenticate.services';

describe('AuthenticateServices', () => {

  let context: AuthenticateContext;
  let event: WebIdEnteredEvent;

  const webIdValidator: WebIdValidator = async (webId: string) => {

    const results: string[] = [];

    try {

      new URL(webId);

    } catch {

      results.push('common.webid-validation.invalid-uri');

    }

    return results;

  };

  beforeEach(() => {

    context = {
      webIdValidator,
    };

    event = {
      webId: 'example.com/profile/card#me',
      type: AuthenticateEvents.WEBID_ENTERED,
    };

  });

  describe('checkWebId', () => {

    it('should return with prefix when no prefix was given and uri is valid', async () => {

      event.webId = 'example.com/profile/card#me';

      (utils as any).addProtocolPrefix = jest.fn().mockResolvedValueOnce('https://example.com/profile/card#me');

      const response = checkWebId(context, event);

      await expect(response).resolves.toBeDefined();

      const result = await response;

      expect(result.validationResults).toHaveLength(0);
      expect(result.webId).toContain('http');
      expect((utils as any).addProtocolPrefix).toHaveBeenCalledTimes(1);

    });

    it('should return given uri when prefix was given and uri is valid', async () => {

      event.webId = 'http://example.com/profile/card#me';

      (utils as any).addProtocolPrefix = jest.fn().mockResolvedValueOnce('http://example.com/profile/card#me');

      const response = checkWebId(context, event);

      await expect(response).resolves.toBeDefined();

      const result = await response;

      expect(result.webId).toBe(event.webId);
      expect(result.validationResults).toHaveLength(0);
      expect((utils as any).addProtocolPrefix).toHaveBeenCalledTimes(1);

    });

    it('should return given uri and append validationResults when addProtocolPrefix throws', async () => {

      (utils as any).addProtocolPrefix = jest.fn().mockRejectedValueOnce('error');

      const response = checkWebId(context, event);

      await expect(response).resolves.toBeDefined();

      const result = await response;

      expect(result.webId).toBe(event.webId);
      expect(result.validationResults).toHaveLength(1);

    });

  });

});
