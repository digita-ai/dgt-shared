import { DGTEntity } from '@digita-ai/dgt-shared-data';

export interface DGTResetPasswordRequest extends DGTEntity {
  state: string;
  user: number;
  email: string;
}
