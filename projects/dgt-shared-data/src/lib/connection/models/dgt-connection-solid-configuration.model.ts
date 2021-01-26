import { DGTLDTypeRegistration } from '../../linked-data/models/dgt-ld-type-registration.model';

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
  sessionInfo?: any;
  typeIndexes: string[];
  typeRegistrations: DGTLDTypeRegistration[];
}
