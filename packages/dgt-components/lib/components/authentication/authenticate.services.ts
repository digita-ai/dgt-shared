import { addProtocolPrefix } from '@digita-ai/dgt-utils';
import { AuthenticateContext, WebIdEnteredEvent } from './authenticate.machine';

export const checkWebId = async (context: AuthenticateContext, event: WebIdEnteredEvent):
Promise<{ webId: string; validationResults: string[] }> => {

  let validationResults: string[] = [];
  let webId = event.webId;

  try {

    webId = event.webId.match(/^https?:\/\/.*$/) ? event.webId : await addProtocolPrefix(event.webId);
    validationResults = await context.webIdValidator(webId);

  } catch(e){

    validationResults.push('common.webid-validation.invalid-uri');

  }

  return { webId, validationResults };

};
