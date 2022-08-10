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

  if (uri.match('^https?://')) return uri ;

  try {

    try {

      const httpsUri = `https://${uri}`;

      return await fetch(httpsUri, { method: 'HEAD' }).then(() => httpsUri);

    } catch(e) {

      const httpUri = `http://${uri}`;

      return await fetch(httpUri, { method: 'HEAD' }).then(() => httpUri);

    }

  } catch(e) {

    throw new Error(`Could not add protocol prefix to ${uri}`);

  }

};

