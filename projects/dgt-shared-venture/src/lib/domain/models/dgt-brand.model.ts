import { DGTBrandState } from './dgt-brand-state.model';
import { DGTEmailTemplateProfile } from '../../email/models/dgt-email-template-profile.model';
import { DGTUpdateType } from './dgt-update-type.model';
import { DGTI8NEntity } from '@digita-ai/dgt-shared-web';

export interface DGTBrand extends DGTI8NEntity, DGTEmailTemplateProfile {
  category: string;
  description: string;
  gift: string;
  label: string;
  logo: string;
  profile: string;
  state: DGTBrandState;
  templates: { [key in string]: string };
  type: DGTUpdateType;
}
