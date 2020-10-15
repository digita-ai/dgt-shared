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
}
