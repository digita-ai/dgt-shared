import { DGTEntity } from '@digita/dgt-shared-data';

export interface DGTResetPasswordRequest extends DGTEntity {
  state: string;
  user: number;
  email: string;
}
