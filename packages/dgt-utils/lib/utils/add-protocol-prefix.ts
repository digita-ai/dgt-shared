import fetch from 'cross-fetch';

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

