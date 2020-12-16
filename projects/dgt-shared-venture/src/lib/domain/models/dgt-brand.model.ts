import { DGTI8NEntity } from '@digita-ai/dgt-shared-web';
import { DGTEmailTemplateProfile } from '../../email/models/dgt-email-template-profile.model';
import { DGTBrandState } from './dgt-brand-state.model';
import { DGTUpdateType } from './dgt-update-type.model';

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
