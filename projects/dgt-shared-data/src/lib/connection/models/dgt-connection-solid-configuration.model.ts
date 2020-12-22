import { Session } from '@inrupt/solid-client-authn-browser';

export interface DGTConnectionSolidConfiguration {
  webId: string;
  accessToken: string;
  expiresIn: string;
  idToken: string;
  state: string;
  requestHistory: { [key: string]: string };
  privateKey: string;
  loginUri: string;
  accountId: string;
  protocol: string;
  refreshToken?: string;
  session?: Session;
}
