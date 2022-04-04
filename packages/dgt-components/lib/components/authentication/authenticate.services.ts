import { addProtocolPrefix } from '@digita-ai/dgt-utils';
import { getLogger, Logger } from '@digita-ai/handlersjs-logging';
import { AuthenticateContext, WebIdEnteredEvent } from './authenticate.machine';

/**
 * Service function for validating WebIDs
 *
 * @param context The context of the machine
 * @param event The event that triggered the service
 * @returns An object containing a list of validation results and the correct prefixed webId.
 */
export const checkWebId = async (context: AuthenticateContext, event: WebIdEnteredEvent):
Promise<{ webId: string; validationResults: string[] }> => {

  let validationResults: string[] = [];
  let webId = event.webId;
  const logger: Logger = getLogger();

  try {

    webId = event.webId.match(/^https?:\/\/.*$/) ? event.webId : await addProtocolPrefix(event.webId);
    logger.info('Checking webid: ' + webId);
    validationResults = await context.webIdValidator(webId);
    logger.info(`Validation results for ${webId}`, validationResults);

  } catch(e){

    logger.error('Validation failed: invalid uri', e);
    validationResults.push('common.webid-validation.invalid-uri');

  }

  return { webId, validationResults };

};
