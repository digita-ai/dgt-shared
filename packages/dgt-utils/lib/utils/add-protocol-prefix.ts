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

      return httpsUri;

    } catch(e) {

      const httpUri = `http://${uri}`;
      await fetch(httpUri, { method: 'HEAD' });

      return httpUri;

    }

  } catch(e) {

    throw new Error(`Could not add protocol prefix to ${uri}`);

  }

};
