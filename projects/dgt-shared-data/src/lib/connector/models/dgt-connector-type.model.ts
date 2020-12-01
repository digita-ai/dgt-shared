import { DGTLDResource } from '@digita-ai/dgt-shared-data/public-api';

export interface DGTConnectorType extends DGTLDResource {
    label: string;
    description: string;
    group: string;
    icon: string;
}
