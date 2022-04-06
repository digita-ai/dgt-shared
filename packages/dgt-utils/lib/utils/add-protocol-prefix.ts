import { getLogger } from '@digita-ai/handlersjs-logging';
import fetch from 'cross-fetch';

/**
 *
 * Function to add protocol prefix to uri if it is missing
 *
 * @param uri The uri to add the protocol prefix to
 * @returns The given uri with the protocol prefix added
 * @throws An error if the given uri is not a valid uri
 */
export const addProtocolPrefix = async (uri: string): Promise<string> => {

  try {

    try {

      const httpsUri = `https://${uri}`;
      await fetch(httpsUri, { method: 'HEAD' });

      getLogger().info('Adding protocol prefix to https uri', uri);

      return httpsUri;

    } catch(e) {

      getLogger().info('Adding protocol prefix to https uri, attempting http', uri);
      const httpUri = `http://${uri}`;
      await fetch(httpUri, { method: 'HEAD' });

      return httpUri;

    }

  } catch(e) {

    getLogger().error('Could not add protocol prefix to uri:', uri);

    throw new Error(`Could not add protocol prefix to ${uri}`);

  }

};

